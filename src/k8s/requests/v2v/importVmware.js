import { get } from 'lodash';

import {
  findModel,
  PersistentVolumeClaimModel,
  PodModel,
  RoleBindingModel,
  RoleModel,
  SecretModel,
  ServiceAccountModel,
  ConfigMapModel,
} from '../../../models';
import {
  NAMESPACE_KEY,
  STORAGE_TYPE_EXTERNAL_IMPORT,
  STORAGE_TYPE_EXTERNAL_V2V_TEMP,
  STORAGE_TYPE_EXTERNAL_V2V_VDDK,
} from '../../../components/Wizard/CreateVmWizard/constants';
import { getName, getNamespace } from '../../../selectors';
import { buildConversionPod, buildConversionPodSecret, buildV2VRole } from '../../objects/v2v';
import { buildPvc, buildServiceAccount, buildServiceAccountRoleBinding } from '../../objects';
import {
  CONVERSION_GENERATE_NAME,
  VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME,
  VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACE,
  CONVERSION_SERVICEACCOUNT_DELAY,
} from './constants';
import { buildOwnerReference, buildAddOwnerReferencesPatch } from '../../util/utils';
import {
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PASSWORD_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from '../../../components/Wizard/CreateVmWizard/providers/VMwareImportProvider/constants';
import { settingsValue } from '../../selectors';
import {
  getVmwareAttribute,
  getVmwareValue,
  getVmwareField,
} from '../../../components/Wizard/CreateVmWizard/providers/VMwareImportProvider/selectors';
import { getValidK8SSize, delay } from '../../../utils';
import { getV2vImagePullPolicy, getKubevirtV2vConversionContainerImage } from '../../../selectors/v2v';
import { getServiceAccountSecrets } from '../../../selectors/serviceaccount/serviceaccount';

const asVolumenMount = ({ name, storageType, data }) => ({
  name,
  mountPath: data && data.mountPath,
});

const asVolume = ({ name, data }) => ({
  name,
  persistentVolumeClaim: {
    claimName: getName(data.pvc) || name,
  },
});

const resolveStorages = async (vmSettings, networks, storages, { k8sCreate }, lastResults, { units }) => {
  const isImportStorage = storage =>
    [STORAGE_TYPE_EXTERNAL_IMPORT, STORAGE_TYPE_EXTERNAL_V2V_TEMP].includes(storage.storageType);
  const namespace = settingsValue(vmSettings, NAMESPACE_KEY);

  const extImportPvcsPromises = storages.filter(isImportStorage).map(storage => {
    const validSize = getValidK8SSize(storage.size, units, 'Gi');
    return k8sCreate(
      PersistentVolumeClaimModel,
      buildPvc({
        ...storage,
        generateName: storage.name,
        name: undefined,
        namespace,
        size: validSize.value,
        unit: validSize.unit.trim(),
      })
    );
  });

  const resultImportPvcs = await Promise.all(extImportPvcsPromises);

  const mappedStorages = storages.map(storage => {
    if (isImportStorage(storage)) {
      return {
        ...storage,
        data: {
          ...storage.data,
          pvc: resultImportPvcs.shift(),
        },
      };
    }
    return storage;
  });
  return {
    mappedStorages,
  };
};

const resolveRolesAndServiceAccount = async (vmSettings, networks, storages, { k8sCreate }) => {
  const namespace = settingsValue(vmSettings, NAMESPACE_KEY);

  const serviceAccount = await k8sCreate(
    ServiceAccountModel,
    buildServiceAccount({ namespace, generateName: CONVERSION_GENERATE_NAME })
  );
  const role = await k8sCreate(RoleModel, buildV2VRole({ namespace }));

  const roleBinding = await k8sCreate(
    RoleBindingModel,
    buildServiceAccountRoleBinding({
      namespace,
      generateName: CONVERSION_GENERATE_NAME,
      serviceAccountName: getName(serviceAccount),
      roleName: getName(role),
    })
  );

  return {
    serviceAccount,
    role,
    roleBinding,
  };
};

const createConversionPodSecret = async (vmSettings, networks, storages, { k8sCreate }) => {
  const namespace = settingsValue(vmSettings, NAMESPACE_KEY);
  const { vm, thumbprint } = getVmwareField(vmSettings, PROVIDER_VMWARE_VM_KEY);

  const extractFromSecret = name =>
    atob(get(getVmwareAttribute(vmSettings, PROVIDER_VMWARE_VCENTER_KEY, 'secret'), ['data', name]));

  const username = encodeURIComponent(
    getVmwareValue(vmSettings, PROVIDER_VMWARE_USER_NAME_KEY) || extractFromSecret('username')
  );
  const password = getVmwareValue(vmSettings, PROVIDER_VMWARE_USER_PASSWORD_KEY) || extractFromSecret('password');

  const hostname = getVmwareValue(vmSettings, PROVIDER_VMWARE_HOSTNAME_KEY) || extractFromSecret('url');

  const sourceDisks = storages
    .filter(storage => storage.storageType === STORAGE_TYPE_EXTERNAL_IMPORT)
    .map(({ data }) => data.fileName);

  const conversionData = {
    daemonize: false,

    vm_name: vm.name,
    transport_method: 'vddk',

    vmware_fingerprint: thumbprint,
    vmware_uri: `vpx://${username}@${hostname}${vm.detail.hostPath}?no_verify=1`,
    vmware_password: password,

    source_disks: sourceDisks,
  };

  const conversionPodSecret = await k8sCreate(
    SecretModel,
    buildConversionPodSecret({ namespace, data: conversionData })
  );

  return {
    conversionPodSecret,
  };
};

/**
 * Workaround for a race condition.
 *
 * A ServiceAccount is provided automatically (but asynchronously) for API tokens (as Secrets).
 * A ServiceAccount can be attached to a pod only if the tokens are ready, otherwise API-level
 * validation throws a permanent error.
 *
 * As a workaround, let's wait till the tokens are ready before proceeding.
 *
 * Note regarding implementation:
 * polling is the simplest method how to wait for changes.
 * There is similar k8sWatchObject function which should be used instead for consistency, but
 * it is implemented using polling as well but with much more complex general contract than this
 * simple flow here.
 */
const waitForServiceAccountSecrets = async (serviceAccount, { k8sGet }, counter = 15) => {
  if (counter <= 0) {
    return false;
  }

  if (getServiceAccountSecrets(serviceAccount).length > 0) {
    return true;
  }

  await delay(CONVERSION_SERVICEACCOUNT_DELAY);
  const sa = await k8sGet(ServiceAccountModel, getName(serviceAccount), getNamespace(serviceAccount));
  return waitForServiceAccountSecrets(sa, { k8sGet }, counter - 1);
};

// Start of the Conversion pod is blocked until the PVCs are bound
const startConversionPod = async (
  vmSettings,
  networks,
  storages,
  { k8sGet, k8sCreate, k8sPatch },
  { serviceAccount, role, roleBinding, mappedStorages, conversionPodSecret }
) => {
  const namespace = settingsValue(vmSettings, NAMESPACE_KEY);
  const volumes = [];
  const volumeMounts = [];

  mappedStorages
    .filter(({ storageType }) =>
      [STORAGE_TYPE_EXTERNAL_IMPORT, STORAGE_TYPE_EXTERNAL_V2V_TEMP, STORAGE_TYPE_EXTERNAL_V2V_VDDK].includes(
        storageType
      )
    )
    .forEach(storage => {
      volumeMounts.push(asVolumenMount(storage));
      volumes.push(asVolume(storage));
    });

  const kubevirtVmwareConfigMap = await k8sGet(
    ConfigMapModel,
    VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME,
    VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACE
  );

  await waitForServiceAccountSecrets(serviceAccount, { k8sGet });

  const conversionPod = await k8sCreate(
    PodModel,
    buildConversionPod({
      volumes,
      volumeMounts,
      namespace,
      serviceAccountName: getName(serviceAccount),
      secretName: getName(conversionPodSecret),
      imagePullPolicy: getV2vImagePullPolicy(kubevirtVmwareConfigMap),
      image: getKubevirtV2vConversionContainerImage(kubevirtVmwareConfigMap),
    })
  );

  if (conversionPod) {
    const newOwnerReferences = [buildOwnerReference(conversionPod)];
    const patchPvcs = mappedStorages
      .filter(storage => storage.storageType === STORAGE_TYPE_EXTERNAL_V2V_TEMP)
      .map(({ data }) => data.pvc);

    const patchPromises = [serviceAccount, role, roleBinding, conversionPodSecret, ...patchPvcs].map(object => {
      const patches = [buildAddOwnerReferencesPatch(object, newOwnerReferences)];
      return k8sPatch(findModel(object), object, patches);
    });
    await Promise.all(patchPromises);
  }

  return {
    conversionPod,
  };
};

export const importVmwareVm = async (vmSettings, networks, storages, { k8sGet, k8sCreate, k8sPatch }, context) =>
  [createConversionPodSecret, resolveRolesAndServiceAccount, resolveStorages, startConversionPod].reduce(
    async (lastResultPromise, stepFunction) => {
      const lastResult = await lastResultPromise;
      const nextResult = await stepFunction(
        vmSettings,
        networks,
        storages,
        {
          k8sGet,
          k8sCreate,
          k8sPatch,
        },
        lastResult,
        context
      );
      return {
        ...lastResult,
        ...nextResult,
      };
    },
    Promise.resolve({})
  );

import { get } from 'lodash';

import {
  findModel,
  PersistentVolumeClaimModel,
  PodModel,
  RoleBindingModel,
  RoleModel,
  SecretModel,
  ServiceAccountModel,
} from '../../../models';
import {
  NAMESPACE_KEY,
  PROVIDERS_DATA_KEY,
  STORAGE_TYPE_EXTERNAL_IMPORT,
  STORAGE_TYPE_EXTERNAL_V2V_TEMP,
  STORAGE_TYPE_EXTERNAL_V2V_VDDK,
} from '../../../components/Wizard/CreateVmWizard/constants';
import { getName } from '../../../selectors';
import { buildConversionPod, buildConversionPodSecret, buildV2VRole, buildVMwareSecret } from '../../objects/v2v';
import { buildPvc, buildServiceAccount, buildServiceAccountRoleBinding } from '../../objects';
import { CONVERSION_GENERATE_NAME } from './constants';
import { buildOwnerReference, buildAddOwnerReferencesPatch } from '../../util/utils';
import {
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PASSWORD_KEY,
  PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
  PROVIDER_VMWARE,
} from '../../../components/Wizard/CreateVmWizard/providers/VMwareImportProvider/constants';
import { settingsValue } from '../../selectors';
import { getValidK8SSize } from '../../../utils';

const getVmwareField = (vmSettings, key) => get(vmSettings, [PROVIDERS_DATA_KEY, PROVIDER_VMWARE, key]);
const getVmwareValue = (vmSettings, key) => get(getVmwareField(vmSettings, key), 'value');
const getVmwareAttribute = (vmSettings, key, attribute) => get(getVmwareField(vmSettings, key), attribute);

const asImportProviderSecret = vmSettings => {
  if (getVmwareValue(vmSettings, PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY)) {
    const url = getVmwareValue(vmSettings, PROVIDER_VMWARE_HOSTNAME_KEY);
    const username = getVmwareValue(vmSettings, PROVIDER_VMWARE_USER_NAME_KEY);
    const password = getVmwareValue(vmSettings, PROVIDER_VMWARE_USER_PASSWORD_KEY);
    const namespace = settingsValue(vmSettings, NAMESPACE_KEY);

    return buildVMwareSecret({
      url,
      username,
      password,
      namespace,
    });
  }

  return null;
};

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

const createProviderSecret = async ({ enhancedK8sMethods: { k8sCreate }, vmSettings }) => {
  const importProviderSecret = asImportProviderSecret(vmSettings);

  if (importProviderSecret) {
    await k8sCreate(SecretModel, importProviderSecret);
  }

  return null;
};

const resolveStorages = async ({ enhancedK8sMethods: { k8sCreate }, vmSettings, networks, storages, units }) => {
  if (!storages) {
    return { mappedStorages: [] };
  }
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

const resolveRolesAndServiceAccount = async ({ enhancedK8sMethods: { k8sCreate }, vmSettings }) => {
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

const createConversionPodSecret = async ({ enhancedK8sMethods: { k8sCreate }, vmSettings, networks, storages }) => {
  const namespace = settingsValue(vmSettings, NAMESPACE_KEY);
  const { vm, thumbprint } = getVmwareField(vmSettings, PROVIDER_VMWARE_VM_KEY);

  const extractFromSecret = name =>
    atob(get(getVmwareAttribute(vmSettings, PROVIDER_VMWARE_VCENTER_KEY, 'secret'), ['data', name]));

  const username = encodeURIComponent(
    getVmwareValue(vmSettings, PROVIDER_VMWARE_USER_NAME_KEY) || extractFromSecret('username')
  );
  const password = getVmwareValue(vmSettings, PROVIDER_VMWARE_USER_PASSWORD_KEY) || extractFromSecret('password');

  const hostname = getVmwareValue(vmSettings, PROVIDER_VMWARE_HOSTNAME_KEY) || extractFromSecret('url');

  const sourceDisks = (storages || [])
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

// // Start of the Conversion pod is blocked until the PVCs are bound
const startConversionPod = async (
  { enhancedK8sMethods: { k8sCreate, k8sPatch }, vmSettings },
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

  const conversionPod = await k8sCreate(
    PodModel,
    buildConversionPod({
      volumes,
      volumeMounts,
      namespace,
      serviceAccountName: getName(serviceAccount),
      secretName: getName(conversionPodSecret),
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

export const importVmwareVm = async ({ enhancedK8sMethods, vmSettings, networks, storages, units }) =>
  [
    createProviderSecret,
    createConversionPodSecret,
    resolveRolesAndServiceAccount,
    resolveStorages,
    startConversionPod,
  ].reduce(async (lastResultPromise, stepFunction) => {
    const lastResult = await lastResultPromise;
    const nextResult = await stepFunction({ enhancedK8sMethods, vmSettings, networks, storages, units }, lastResult);
    return {
      ...lastResult,
      ...nextResult,
    };
  }, Promise.resolve({}));

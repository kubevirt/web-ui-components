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
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_DATA_KEY,
  PROVIDER_VMWARE_VM_KEY,
  STORAGE_TYPE_EXTERNAL_IMPORT,
  STORAGE_TYPE_EXTERNAL_V2V_TEMP,
  STORAGE_TYPE_EXTERNAL_V2V_VDDK,
} from '../../../components/Wizard/CreateVmWizard/constants';
import { getImportProviderSecretObject } from '../../../components/Wizard/CreateVmWizard/providers/vmwareProviderPod';
import { getName } from '../../../selectors';
import { buildConversionPod, buildConversionPodSecret, buildV2VRole } from '../../objects/v2v';
import { buildPvc, buildServiceAccount, buildServiceAccountRoleBinding } from '../../objects';
import { CONVERSION_GENERATE_NAME } from './constants';
import { buildOwnerReference, buildAddOwnerReferencesPatch } from '../../util/utils';

const asImportProviderSecret = getSetting => {
  if (getSetting(PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY)) {
    const url = getSetting(PROVIDER_VMWARE_HOSTNAME_KEY);
    const username = getSetting(PROVIDER_VMWARE_USER_NAME_KEY);
    const password = get(getSetting(PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY), PROVIDER_VMWARE_USER_PWD_KEY);
    const namespace = getSetting(NAMESPACE_KEY);

    return getImportProviderSecretObject({
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

const createProviderSecret = async (getSetting, networks, storages, { k8sCreate }) => {
  const importProviderSecret = asImportProviderSecret(getSetting);

  if (importProviderSecret) {
    await k8sCreate(SecretModel, importProviderSecret);
  }

  return null;
};

const resolveStorages = async (getSetting, networks, storages, { k8sCreate }) => {
  const isImportStorage = storage =>
    [STORAGE_TYPE_EXTERNAL_IMPORT, STORAGE_TYPE_EXTERNAL_V2V_TEMP].includes(storage.storageType);
  const namespace = getSetting(NAMESPACE_KEY);

  const extImportPvcsPromises = storages.filter(isImportStorage).map(storage =>
    k8sCreate(
      PersistentVolumeClaimModel,
      buildPvc({
        ...storage,
        generateName: storage.name,
        name: undefined,
        namespace,
      })
    )
  );

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

const resolveRolesAndServiceAccount = async (getSetting, networks, storages, { k8sCreate }) => {
  const namespace = getSetting(NAMESPACE_KEY);

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

const createConversionPodSecret = async (getSetting, networks, storages, { k8sCreate }) => {
  const namespace = getSetting(NAMESPACE_KEY);
  const vmWareData = getSetting(PROVIDER_VMWARE_VM_DATA_KEY);

  const extractFromSecret = name => atob(get(getSetting(PROVIDER_VMWARE_VCENTER_KEY), ['data', name]));

  const username = encodeURIComponent(getSetting(PROVIDER_VMWARE_USER_NAME_KEY) || extractFromSecret('username'));
  const password =
    get(getSetting(PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY), PROVIDER_VMWARE_USER_PWD_KEY) ||
    extractFromSecret('password');

  const hostname = getSetting(PROVIDER_VMWARE_HOSTNAME_KEY) || extractFromSecret('url');

  const sourceDisks = storages
    .filter(storage => storage.storageType === STORAGE_TYPE_EXTERNAL_IMPORT)
    .map(({ data }) => data.fileName);

  const conversionData = {
    daemonize: false,

    vm_name: getSetting(PROVIDER_VMWARE_VM_KEY),
    transport_method: 'vddk',

    vmware_fingerprint: vmWareData && vmWareData.thumbPrint,
    vmware_uri: `vpx://${username}@${hostname}${vmWareData && vmWareData.hostPath}?no_verify=1`,
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
  getSetting,
  networks,
  storages,
  { k8sCreate, k8sPatch },
  { serviceAccount, role, roleBinding, mappedStorages, conversionPodSecret }
) => {
  const namespace = getSetting(NAMESPACE_KEY);
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

export const importVmwareVm = async (getSetting, networks, storages, { k8sCreate, k8sPatch }) =>
  [
    createProviderSecret,
    createConversionPodSecret,
    resolveRolesAndServiceAccount,
    resolveStorages,
    startConversionPod,
  ].reduce(async (lastResultPromise, stepFunction) => {
    const lastResult = await lastResultPromise;
    const nextResult = await stepFunction(
      getSetting,
      networks,
      storages,
      {
        k8sCreate,
        k8sPatch,
      },
      lastResult
    );
    return {
      ...lastResult,
      ...nextResult,
    };
  }, Promise.resolve({}));

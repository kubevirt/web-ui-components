import { get } from 'lodash';

import { PersistentVolumeClaimModel, PodModel, SecretModel } from '../models';
import {
  NAMESPACE_KEY,
  PROVIDER_VMWARE_URL_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY,
} from '../components/Wizard/CreateVmWizard/constants';
import { getImportProviderSecretObject } from '../components/Wizard/CreateVmWizard/providers/vmwareProviderPod';

const getImportProviderSecret = getSetting => {
  if (getSetting(PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY)) {
    const url = getSetting(PROVIDER_VMWARE_URL_KEY);
    const username = getSetting(PROVIDER_VMWARE_USER_NAME_KEY);
    const password = get(getSetting(PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY), PROVIDER_VMWARE_USER_PWD_KEY);
    const namespace = getSetting(NAMESPACE_KEY);

    return getImportProviderSecretObject({ url, username, password, namespace });
  }

  return null;
};

const getImportPVC = storageRow => ({
  // TODO: k8s object
});

const getConversionPod = () =>
  // mount
  //   - /data/input  - job description in JSON, mount as a Secret object; https://github.com/oVirt/v2v-conversion-host/blob/95d26ec5f431c72d42083f759e403a6e9df8a6d2/kubevirt-conversion-pod/entrypoint#L25
  //   - /data/vm/disk1 - PVC1 ; https://github.com/oVirt/v2v-conversion-host/blob/ed3447c48f910ee67f340dbb707f24c4b4ad43ce/kubevirt-conversion-test/Dockerfile
  //   - /data/vm/disk2 - PVC2

  ({
    // TODO: k8s object
  });

export const importVmwareVm = async (getSetting, networks, storage, k8sCreate) => {
  const results = [];

  const importProviderSecret = getImportProviderSecret(getSetting);
  if (importProviderSecret) {
    results.push(await k8sCreate(SecretModel, importProviderSecret));
  }

  console.log('--- importVmwareVm, storage: ', storage);
  const promises = [];
  for (const row of storage) {
    console.log('--- importVmwareVm, row: ', row);
    promises.push(k8sCreate(PersistentVolumeClaimModel, getImportPVC(row)));
  }
  const pvcResults = await Promise.all(promises);
  results.concat(pvcResults);

  // Start of the Conversion pod is blocked until the PVCs are bound
  results.push(await k8sCreate(PodModel, getConversionPod()));

  // TODO:
  //  add PVCs to the VM - to be resolved: a PV can be
  //  mark the VM as "import in progress" - TBD

  return results;
};

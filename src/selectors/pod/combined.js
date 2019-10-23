import { findPodWithOneOfStatuses } from '.';
import { CDI_KUBEVIRT_IO, STORAGE_IMPORT_PVC_NAME } from '../../constants';
import { getDataVolumeTemplates } from '../vm';
import { getName, getNamespace, getLabelValue, getOwnerReferences } from '../common';
import { buildOwnerReference, compareOwnerReference } from '../../k8s/util';
import { CONVERSION_GENERATE_NAME } from '../../k8s/requests/v2v/constants';

export const findVmPod = (pods, vm, podNamePrefix) => {
  if (!pods) {
    return null;
  }
  const prefix = `${podNamePrefix}${getName(vm)}-`;
  const prefixedPods = pods.filter(p => getNamespace(p) === getNamespace(vm) && getName(p).startsWith(prefix));

  return (
    findPodWithOneOfStatuses(prefixedPods, ['Running', 'Pending']) ||
    findPodWithOneOfStatuses(prefixedPods, ['Failed', 'Unknown']) // 2nd priority
  );
};

export const findConversionPod = (pods, vm) => {
  if (!pods) {
    return null;
  }

  const vmOwnerReference = buildOwnerReference(vm);

  return pods.find(pod => {
    const podOwnerReferences = getOwnerReferences(pod);
    return (
      getNamespace(pod) === getNamespace(vm) &&
      getName(pod).startsWith(CONVERSION_GENERATE_NAME) &&
      podOwnerReferences &&
      podOwnerReferences.find(podOwnerReference => compareOwnerReference(podOwnerReference, vmOwnerReference))
    );
  });
};

export const getVmImporterPods = (pods, vm, pvcNameLabel = `${CDI_KUBEVIRT_IO}/${STORAGE_IMPORT_PVC_NAME}`) => {
  if (!pods) {
    return null;
  }

  const datavolumeNames = getDataVolumeTemplates(vm)
    .map(dataVolumeTemplate => getName(dataVolumeTemplate))
    .filter(dataVolumeTemplate => dataVolumeTemplate);

  return pods.filter(
    p =>
      getNamespace(p) === getNamespace(vm) &&
      getLabelValue(p, CDI_KUBEVIRT_IO) === 'importer' &&
      datavolumeNames.find(name => getLabelValue(p, pvcNameLabel) === name)
  );
};

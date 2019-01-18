import { has, get } from 'lodash';

import { VirtualMachineModel, DataVolumeModel } from '../models';
import {
  getVolumes,
  getNamespace,
  getName,
  getInterfaces,
  getPvcResources,
  getActualPvcCapacity,
  getPvcAccessModes,
} from '../utils/selectors';
import { getStartStopPatch } from '../utils';

export const clone = async (
  k8sCreate,
  k8sPatch,
  vm,
  newName,
  newNamespace,
  newDescription,
  startVm,
  persistentVolumeClaims,
  dataVolumes
) => {
  const stopVmPatch = getStartStopPatch(vm, false);
  await k8sPatch(VirtualMachineModel, vm, stopVmPatch);

  const cloneDiskPromises = cloneDisks(k8sCreate, vm, newNamespace, persistentVolumeClaims, dataVolumes);
  const promises = cloneDiskPromises.map(cloneDisk => cloneDisk.promise);
  const diskResults = await Promise.all(promises);
  return cloneVm(
    k8sCreate,
    vm,
    newName,
    newNamespace,
    newDescription,
    startVm,
    cloneDiskPromises.map((disk, index) => ({
      ...disk,
      result: diskResults[index],
    }))
  );
};

export const cloneDisks = (k8sCreate, vm, newNamespace, persistentVolumeClaims, dataVolumes) => {
  const pvcClones = getPvcClones(vm, newNamespace, persistentVolumeClaims);
  const dataVolumeClones = getDataVolumeClones(vm, newNamespace, persistentVolumeClaims, dataVolumes);
  const diskClones = [...pvcClones, ...dataVolumeClones];
  const clonePromises = diskClones.map(diskClone => ({
    ...diskClone,
    promise: k8sCreate(DataVolumeModel, diskClone.clone),
  }));
  return clonePromises;
};

export const cloneVm = (k8sCreate, vm, newName, newNamespace, newDescription, startVm, clonedDisks) => {
  cleanVm(vm);
  updateVm(vm, newName, newNamespace, newDescription, startVm);

  cleanNetworks(vm);

  clonedDisks.forEach(disk => {
    const volume = getVolumes(vm).find(v => v.name === disk.volumeName);

    if (volume) {
      if (volume.persistentVolumeClaim) {
        delete volume.persistentVolumeClaim;
      }

      volume.dataVolume = {
        name: getName(disk.result),
      };
    }
  });

  return k8sCreate(VirtualMachineModel, vm);
};

const cleanNetworks = vm => {
  getInterfaces(vm).forEach(intface => delete intface.macAddress);
};

const cleanVm = vm => {
  delete vm.metadata.selfLink;
  delete vm.metadata.resourceVersion;
  delete vm.metadata.uid;
  delete vm.metadata.creationTimestamp;
  delete vm.metadata.generation;

  // delete all datavolumetemplates
  if (has(vm.spec, 'dataVolumeTemplates')) {
    delete vm.spec.dataVolumeTemplates;
  }

  delete vm.status;
};

const updateVm = (vm, name, namespace, description, startVm) => {
  vm.metadata.name = name;
  vm.metadata.namespace = namespace;
  vm.metadata.annotations = {
    ...(vm.metadata.annotations || {}),
    description,
  };

  vm.spec = {
    ...(vm.spec || {}),
    running: startVm,
  };
};

const getDataVolumeClones = (vm, newNamespace, persistentVolumeClaims, dataVolumes) => {
  const volumes = getVolumes(vm);
  const clones = [];
  volumes.filter(volume => volume.dataVolume).forEach(volume => {
    const dvName = volume.dataVolume.name;
    const dataVolume = dataVolumes.find(dv => getName(dv) === dvName && getNamespace(dv) === getNamespace(vm));

    if (dataVolume) {
      // dv succeeded and PVC is filled with data
      if (get(dataVolume, 'status.phase') === 'Succeeded') {
        const pvcToClone = persistentVolumeClaims.find(
          pvc => getNamespace(pvc) === getNamespace(dataVolume) && getName(pvc) === dvName
        );
        if (pvcToClone) {
          clones.push(getPvcCloneDefinition(pvcToClone, newNamespace, volume.name));
          return;
        }
      }
      clones.push(getDataVolumeCloneDefinition(dataVolume, newNamespace, volume.name));
    }
  });
  return clones;
};

const getPvcClones = (vm, newNamespace, persistentVolumeClaims) => {
  const volumes = getVolumes(vm);
  const pvcClones = [];
  volumes.filter(volume => volume.persistentVolumeClaim).forEach(volume => {
    const pvcName = volume.persistentVolumeClaim.claimName;
    const pvcToClone = persistentVolumeClaims.find(
      pvc => getName(pvc) === pvcName && getNamespace(pvc) === getNamespace(vm)
    );
    if (pvcToClone) {
      pvcClones.push(getPvcCloneDefinition(pvcToClone, newNamespace, volume.name));
    }
  });
  return pvcClones;
};

const getPvcCloneDefinition = (pvc, newNamespace, volumeName) => {
  const pvcName = getName(pvc);
  const pvcToClone = {
    volumeName,
    clone: {
      kind: DataVolumeModel.kind,
      apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
      metadata: {
        generateName: `${pvcName}-clone-`,
        namespace: newNamespace,
      },
      spec: {
        source: {
          pvc: {
            name: pvcName,
            namespace: getNamespace(pvc),
          },
        },
        pvc: {
          accessModes: getPvcAccessModes(pvc),
          resources: {
            requests: {
              storage: getActualPvcCapacity(pvc) || getPvcResources(pvc),
            },
          },
        },
      },
    },
  };

  return pvcToClone;
};

const getDataVolumeCloneDefinition = (dataVolume, newNamespace, volumeName) => {
  const dataVolumeName = getName(dataVolume);
  const dataVolumeToClone = {
    volumeName,
    clone: {
      kind: DataVolumeModel.kind,
      apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
      metadata: {
        generateName: `${dataVolumeName}-clone-`,
        namespace: newNamespace,
      },
      spec: { ...dataVolume.spec },
    },
  };

  return dataVolumeToClone;
};

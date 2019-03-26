import {
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_IMPORT_ERROR,
  VM_STATUS_IMPORTING,
  VM_STATUS_MIGRATING,
  VM_STATUS_OFF,
  VM_STATUS_RUNNING,
  VM_STATUS_STARTING,
  VM_STATUS_VMI_WAITING,
  VM_STATUS_UNKNOWN,
  VM_STATUS_OTHER,
} from './constants';

import { VIRT_LAUNCHER_POD_PREFIX } from '../../../constants';
import {
  getStatusConditions,
  isMigrating,
  isVmRunning,
  isVmReady,
  isVmCreated,
  getStatusPhase,
  findVMIMigration,
  findVmPod,
  getVmImporterPods,
} from '../../../selectors';

import { getPodStatus, POD_STATUS_ALL_ERROR, POD_STATUS_READY, POD_STATUS_NOT_SCHEDULABLE } from '../pod';

import { NOT_HANDLED } from '..';

const isBeingMigrated = (vm, migration) => {
  if (isMigrating(migration)) {
    return { status: VM_STATUS_MIGRATING, message: getStatusPhase(migration) };
  }
  return NOT_HANDLED;
};

const isRunning = vm => (isVmRunning(vm) ? NOT_HANDLED : { status: VM_STATUS_OFF });

const isReady = (vm, launcherPod) => {
  if (isVmReady(vm)) {
    // we are all set
    return {
      status: VM_STATUS_RUNNING,
      launcherPod,
    };
  }
  return NOT_HANDLED;
};

const isVmError = vm => {
  // is an issue with the VM definition?
  const condition = getStatusConditions(vm)[0];
  if (condition) {
    // Do we need to analyze additional conditions in the array? Probably not.
    if (condition.type === 'Failure') {
      return { status: VM_STATUS_ERROR, message: condition.message };
    }
  }
  return NOT_HANDLED;
};

const isCreated = (vm, launcherPod = null) => {
  if (isVmCreated(vm)) {
    // created but not yet ready
    if (launcherPod) {
      const podStatus = getPodStatus(launcherPod);
      if (POD_STATUS_ALL_ERROR.includes(podStatus.status)) {
        return {
          ...podStatus,
          status: VM_STATUS_POD_ERROR,
          launcherPod,
        };
      }
      if (podStatus.status !== POD_STATUS_READY) {
        return {
          ...podStatus,
          status: VM_STATUS_STARTING,
          launcherPod,
        };
      }
    }
    return { status: VM_STATUS_STARTING, launcherPod };
  }
  return NOT_HANDLED;
};

const isBeingImported = (vm, importerPods) => {
  if (importerPods && importerPods.length > 0 && !isVmCreated(vm)) {
    const importerPodsStatuses = importerPods.map(pod => {
      const podStatus = getPodStatus(pod);
      if (POD_STATUS_ALL_ERROR.includes(podStatus.status)) {
        return {
          ...podStatus,
          message: POD_STATUS_NOT_SCHEDULABLE ? 'Importer pod scheduling failed.' : podStatus.message,
          status: VM_STATUS_IMPORT_ERROR,
          pod,
        };
      }
      return {
        status: VM_STATUS_IMPORTING,
        message: podStatus.message,
        pod,
      };
    });
    const importErrorStatus = importerPodsStatuses.find(status => status.status === VM_STATUS_IMPORT_ERROR);
    const message = importerPodsStatuses
      .map(podStatus => `${podStatus.pod.metadata.name}: ${podStatus.message}`)
      .join('\n\n');

    return {
      status: importErrorStatus ? importErrorStatus.status : VM_STATUS_IMPORTING,
      message,
      pod: importErrorStatus ? importErrorStatus.pod : importerPods[0],
      importerPodsStatuses,
    };
  }
  return NOT_HANDLED;
};

const isWaitingForVmi = vm => {
  // assumption: spec.running === true
  if (!isVmCreated(vm)) {
    return { status: VM_STATUS_VMI_WAITING };
  }
  return NOT_HANDLED;
};

export const getVmStatus = (vm, pods, migrations, importerPods = null) => {
  const launcherPod = findVmPod(pods, vm, VIRT_LAUNCHER_POD_PREFIX);
  const migration = findVMIMigration(migrations, vm);
  const vmImporterPods = getVmImporterPods(importerPods || pods, vm);
  return (
    isBeingMigrated(vm, migration) || // must be precceding isRunning() since vm.status.ready is true for a migrating VM
    isRunning(vm) ||
    isReady(vm, launcherPod) ||
    isVmError(vm) ||
    isCreated(vm, launcherPod) ||
    isBeingImported(vm, vmImporterPods) ||
    isWaitingForVmi(vm) || { status: VM_STATUS_UNKNOWN }
  );
};

export const getSimpleVmStatus = (vm, pods, migrations, importerPods) => {
  const vmStatus = getVmStatus(vm, pods, migrations, importerPods).status;
  return vmStatus === VM_STATUS_OFF || vmStatus === VM_STATUS_RUNNING ? vmStatus : VM_STATUS_OTHER;
};

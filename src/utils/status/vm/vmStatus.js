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

import {
  isPodSchedulable,
  getStatusConditions,
  getContainerStatuses,
  isContainerFailing,
  isMigrating,
  isVmRunning,
  isVmReady,
  isVmCreated,
  getContainerStatusReason,
  getMigrationStatusPhase,
} from '../../../selectors';

const NOT_HANDLED = null;

const getNotRedyConditionMessage = pod => {
  const notReadyCondition = getStatusConditions(pod).find(condition => condition.status !== 'True');
  if (notReadyCondition) {
    // at least one pod condition not met. This can be just tentative, let the user analyze progress via Pod events
    return notReadyCondition.message || `Step: ${notReadyCondition.type}`;
  }
  return undefined;
};

const findFailingContainerStatus = pod => getContainerStatuses(pod).find(isContainerFailing);

export const isBeingMigrated = (vm, migration) => {
  if (isMigrating(migration)) {
    return { status: VM_STATUS_MIGRATING, message: getMigrationStatusPhase(migration) };
  }
  return NOT_HANDLED;
};

const isRunning = vm => (isVmRunning(vm) ? NOT_HANDLED : { status: VM_STATUS_OFF });

const isReady = vm => {
  if (isVmReady(vm)) {
    // we are all set
    return { status: VM_STATUS_RUNNING };
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
    let message;
    if (launcherPod) {
      // pod created, so check for it's potential error
      if (!isPodSchedulable(launcherPod)) {
        return { status: VM_STATUS_POD_ERROR, message: 'Pod scheduling failed.' };
      }

      const failingContainer = findFailingContainerStatus(launcherPod);
      if (failingContainer) {
        return { status: VM_STATUS_POD_ERROR, message: getContainerStatusReason(failingContainer) };
      }

      message = getNotRedyConditionMessage(launcherPod);
    }
    return { status: VM_STATUS_STARTING, message };
  }
  return NOT_HANDLED;
};

const isBeingImported = (vm, importerPods) => {
  if (importerPods && importerPods.length > 0 && !isVmCreated(vm)) {
    const importerPodsStatuses = importerPods.map(pod => {
      if (!isPodSchedulable(pod)) {
        return {
          status: VM_STATUS_IMPORT_ERROR,
          message: 'Importer pod scheduling failed.',
          pod,
        };
      }

      const failingContainer = findFailingContainerStatus(pod);
      if (failingContainer) {
        return {
          status: VM_STATUS_IMPORT_ERROR,
          message: getContainerStatusReason(failingContainer),
          pod,
        };
      }
      return {
        status: VM_STATUS_IMPORTING,
        message: getNotRedyConditionMessage(pod),
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

export const getVmStatus = (vm, launcherPod, importerPods, migration) =>
  isBeingMigrated(vm, migration) || // must be precceding isRunning() since vm.status.ready is true for a migrating VM
  isRunning(vm) ||
  isReady(vm) ||
  isVmError(vm) ||
  isCreated(vm, launcherPod) ||
  isBeingImported(vm, importerPods) ||
  isWaitingForVmi(vm) || { status: VM_STATUS_UNKNOWN };

export const getSimpleVmStatus = (vm, launcherPod, importerPods, migration) => {
  const vmStatus = getVmStatus(vm, launcherPod, importerPods, migration).status;
  return vmStatus === VM_STATUS_OFF || vmStatus === VM_STATUS_RUNNING ? vmStatus : VM_STATUS_OTHER;
};

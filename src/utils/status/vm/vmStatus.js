import { get, includes } from 'lodash';

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

const NOT_HANDLED = null;

const failingContainerStatus = ['ImagePullBackOff', 'ErrImagePull', 'CrashLoopBackOff'];

const isMigrationStatus = (migration, status) => {
  const phase = get(migration, 'status.phase');
  return phase && phase.toLowerCase() === status.toLowerCase();
};

const getConditionOfType = (pod, type) => get(pod, 'status.conditions', []).find(condition => condition.type === type);

const getNotRedyConditionMessage = pod => {
  const notReadyCondition = get(pod, 'status.conditions', []).find(condition => condition.status !== 'True');
  if (notReadyCondition) {
    // at least one pod condition not met. This can be just tentative, let the user analyze progress via Pod events
    return notReadyCondition.message || `Step: ${notReadyCondition.type}`;
  }
  return undefined;
};

const getFailingContainerStatus = pod =>
  get(pod, 'status.containerStatuses', []).find(
    container => !container.ready && includes(failingContainerStatus, get(container, 'state.waiting.reason'))
  );

const getContainerStatusReason = containerStatus => {
  const status = Object.getOwnPropertyNames(containerStatus.state).find(pn => !!containerStatus.state[pn].reason);
  return status ? containerStatus.state[status].message : undefined;
};

const isSchedulable = pod => {
  const podScheduledCond = getConditionOfType(pod, 'PodScheduled');
  return !(podScheduledCond && podScheduledCond.status !== 'True' && podScheduledCond.reason === 'Unschedulable');
};

export const isRunning = vm => {
  if (!get(vm, 'spec.running', false)) {
    return { status: VM_STATUS_OFF };
  }
  // spec.running === true
  return NOT_HANDLED;
};

const isReady = vm => {
  if (get(vm, 'status.ready', false)) {
    // we are all set
    return { status: VM_STATUS_RUNNING };
  }
  return NOT_HANDLED;
};

const isCreated = (vm, launcherPod = null) => {
  if (get(vm, 'status.created', false)) {
    // created but not yet ready
    let message;
    if (launcherPod) {
      // pod created, so check for it's potential error
      if (!isSchedulable(launcherPod)) {
        return { status: VM_STATUS_POD_ERROR, message: 'Pod scheduling failed.' };
      }

      const failingContainer = getFailingContainerStatus(launcherPod);
      if (failingContainer) {
        return { status: VM_STATUS_POD_ERROR, message: getContainerStatusReason(failingContainer) };
      }

      message = getNotRedyConditionMessage(launcherPod);
    }
    return { status: VM_STATUS_STARTING, message };
  }
  return NOT_HANDLED;
};

const isVmError = vm => {
  // is an issue with the VM definition?
  const condition = get(vm, 'status.conditions[0]');
  if (condition) {
    // Do we need to analyze additional conditions in the array? Probably not.
    if (condition.type === 'Failure') {
      return { status: VM_STATUS_ERROR, message: condition.message };
    }
  }
  return NOT_HANDLED;
};

const isBeingImported = (vm, importerPods) => {
  if (importerPods && importerPods.length > 0 && !get(vm, 'status.created', false)) {
    const importerPodsStatuses = importerPods.map(pod => {
      if (!isSchedulable(pod)) {
        return {
          status: VM_STATUS_IMPORT_ERROR,
          message: 'Importer pod scheduling failed.',
          pod,
        };
      }

      const failingContainer = getFailingContainerStatus(pod);
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

export const isBeingMigrated = (vm, migration) => {
  if (migration) {
    if (!isMigrationStatus(migration, 'succeeded') && !isMigrationStatus(migration, 'failed')) {
      return { status: VM_STATUS_MIGRATING, message: get(migration, 'status.phase') };
    }
  }
  return NOT_HANDLED;
};

const isWaitingForVmi = vm => {
  // assumption: spec.running === true
  if (!get(vm, 'status.created', false)) {
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

export const isVmiRunning = vmi => get(vmi, 'status.phase') === 'Running';
export const isVmStarting = (vm, vmi) => get(vm, 'spec.running') && !isVmiRunning(vmi);

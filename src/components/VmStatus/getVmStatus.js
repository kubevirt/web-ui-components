import { get } from 'lodash';
import {
  VM_STATUS_POD_ERROR,
  VM_STATUS_ERROR,
  VM_STATUS_IMPORT_ERROR,
  VM_STATUS_IMPORTING,
  VM_STATUS_MIGRATING,
  VM_STATUS_OFF,
  VM_STATUS_RUNNING,
  VM_STATUS_STARTING,
  VM_STATUS_UNKNOWN,
  VM_STATUS_OTHER,
} from '../../constants';

const NOT_HANDLED = null;

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
    container =>
      !container.ready &&
      (get(container, 'state.waiting.reason') === 'ImagePullBackOff' ||
        get(container, 'state.waiting.reason') === 'ErrImagePull')
  );

const getContainerStatusReason = containerStatus => {
  const status = Object.getOwnPropertyNames(containerStatus.state).find(pn => !!containerStatus.state[pn].reason);
  return status ? containerStatus.state[status].message : undefined;
};

const isRunning = vm => {
  if (!get(vm, 'spec.running', false)) {
    return { status: VM_STATUS_OFF };
  }
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
      const podScheduledCond = getConditionOfType(launcherPod, 'PodScheduled');
      if (podScheduledCond && podScheduledCond.status !== 'True' && podScheduledCond.reason === 'Unschedulable') {
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

const isBeingImported = (vm, importerPod) => {
  if (importerPod && !get(vm, 'status.created', false)) {
    const podScheduledCond = getConditionOfType(importerPod, 'PodScheduled');
    if (podScheduledCond && podScheduledCond.status !== 'True' && podScheduledCond.reason === 'Unschedulable') {
      return { status: VM_STATUS_IMPORT_ERROR, message: 'Importer pod scheduling failed.' };
    }
    return { status: VM_STATUS_IMPORTING, message: getNotRedyConditionMessage(importerPod) };
  }
  return NOT_HANDLED;
};

const isBeingMigrated = (vm, migration) => {
  if (migration) {
    if (!get(migration, 'status.ready') && !get(migration, 'status.failed')) {
      return { status: VM_STATUS_MIGRATING, message: get(migration, 'status.phase') };
    }
  }
  return NOT_HANDLED;
};

export const getVmStatusDetail = (vm, launcherPod, importerPod, migration) =>
  isBeingMigrated(vm, migration) || // must be precceding isRunning() since vm.status.ready is true for a migrating VM
  isRunning(vm) ||
  isReady(vm) ||
  isVmError(vm) ||
  isCreated(vm, launcherPod) ||
  isBeingImported(vm, importerPod) || { status: VM_STATUS_UNKNOWN };

export const getVmStatus = (vm, launcherPod, importerPod, migration) => {
  const vmStatus = getVmStatusDetail(vm, launcherPod, importerPod, migration).status;
  return vmStatus === VM_STATUS_OFF || vmStatus === VM_STATUS_RUNNING ? vmStatus : VM_STATUS_OTHER;
};

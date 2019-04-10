import { get, includes } from 'lodash';

const failedWaitingContainerReasons = ['ImagePullBackOff', 'ErrImagePull', 'CrashLoopBackOff'];
const failedTerminationContaineReasons = ['Error'];

const getContainerWaitingReason = container => get(container, 'state.waiting.reason');
const getContainerTerminatedReason = container => get(container, 'state.terminated.reason');

const stateReasonResolver = {
  terminated: ({ reason, exitCode }) => `Terminated with ${reason}${exitCode ? ` (exit code ${exitCode}).` : '.'}`,
  waiting: ({ reason }) => `Waiting (${reason}).`,
};
export const isContainerFailing = container =>
  !container.ready &&
  (includes(failedWaitingContainerReasons, getContainerWaitingReason(container)) ||
    includes(failedTerminationContaineReasons, getContainerTerminatedReason(container)));

export const getContainerStatusReason = containerStatus => {
  if (containerStatus) {
    const stateName = Object.getOwnPropertyNames(containerStatus.state).find(pn => !!containerStatus.state[pn].reason);
    if (stateName) {
      const state = containerStatus.state[stateName];
      return state.message || (stateReasonResolver[stateName] && stateReasonResolver[stateName](state)) || stateName;
    }
  }
  return undefined;
};

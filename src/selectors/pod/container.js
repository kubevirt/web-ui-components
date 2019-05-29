import { get, getConditionReason } from '..';

import { Iterable } from 'immutable';

const failedWaitingContainerReasons = new Set(['ImagePullBackOff', 'ErrImagePull', 'CrashLoopBackOff']);
const failedTerminationContaineReasons = new Set(['Error']);

const getContainerWaitingReason = container => get(container, 'state.waiting.reason');
export const getContainerImage = container => get(container, 'image');
const getContainerTerminatedReason = container => get(container, 'state.terminated.reason');

const stateReasonResolver = {
  terminated: o => {
    const exitCode = get(o, 'exitCode');
    return `Terminated with ${getConditionReason(o)}${exitCode ? ` (exit code ${exitCode}).` : '.'}`;
  },
  waiting: o => `Waiting (${getConditionReason(o)}).`,
};
export const isContainerFailing = container =>
  (!get(container, 'ready') && failedWaitingContainerReasons.has(getContainerWaitingReason(container))) ||
  failedTerminationContaineReasons.has(getContainerTerminatedReason(container));

export const getContainerStatusReason = containerStatus => {
  const state = get(containerStatus, 'state');
  if (state) {
    const stateKeys = Iterable.isIterable(state) ? state.keySeq() : Object.keys(state);
    const stateName = stateKeys.find(pn => !!get(state, [pn, 'reason']));
    if (stateName) {
      const foundState = get(state, stateName);
      return (
        get(foundState, 'message') ||
        (stateReasonResolver[stateName] && stateReasonResolver[stateName](foundState)) ||
        stateName
      );
    }
  }
  return undefined;
};

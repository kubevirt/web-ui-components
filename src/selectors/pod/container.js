import { get, includes } from 'lodash';

const failingContainerStatus = ['ImagePullBackOff', 'ErrImagePull', 'CrashLoopBackOff'];

const getContainerWaitingReason = container => get(container, 'state.waiting.reason');

export const isContainerFailing = container =>
  !container.ready && includes(failingContainerStatus, getContainerWaitingReason(container));

export const getContainerStatusReason = containerStatus => {
  const status = Object.getOwnPropertyNames(containerStatus.state).find(pn => !!containerStatus.state[pn].reason);
  return status ? containerStatus.state[status].message : undefined;
};

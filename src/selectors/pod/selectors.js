import { get } from 'lodash';

import { getStatusConditionOfType, getStatusPhase } from '../common';
import { isContainerFailing } from './container';

export const getNodeName = pod => get(pod, 'spec.nodeName');
export const getHostName = pod => get(pod, 'spec.hostname');
export const getContainerStatuses = pod => get(pod, 'status.containerStatuses', []);

export const isPodSchedulable = pod => {
  const podScheduledCond = getStatusConditionOfType(pod, 'PodScheduled');
  return !(podScheduledCond && podScheduledCond.status !== 'True' && podScheduledCond.reason === 'Unschedulable');
};

export const findFailingContainerStatus = pod => getContainerStatuses(pod).find(isContainerFailing);
export const findPodWithOneOfStatuses = (pods, statuses) =>
  pods.find(p => {
    const phase = getStatusPhase(p);
    return statuses.find(status => status === phase);
  });

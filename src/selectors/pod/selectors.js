import { get } from 'lodash';

import { getStatusConditionOfType } from '../common';

export const getNodeName = pod => get(pod, 'spec.nodeName');
export const getHostName = pod => get(pod, 'spec.hostname');
export const getContainerStatuses = pod => get(pod, 'status.containerStatuses', []);

export const isPodSchedulable = pod => {
  const podScheduledCond = getStatusConditionOfType(pod, 'PodScheduled');
  return !(podScheduledCond && podScheduledCond.status !== 'True' && podScheduledCond.reason === 'Unschedulable');
};

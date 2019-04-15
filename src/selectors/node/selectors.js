import { get } from 'lodash';

export const getNodeUnschedulable = node => get(node, 'spec.unschedulable', false);

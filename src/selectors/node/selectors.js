import { get } from 'lodash';

export const isNodeUnschedulable = node => get(node, 'spec.unschedulable', false);

import { get } from 'lodash';

import { getName } from '../common';

export const findNodeMaintenance = (node, maintenances = []) =>
  maintenances.find(maintenance => get(maintenance, 'spec.nodeName') === getName(node));

export const getNodeMaintenanceDeletion = maintenance => get(maintenance, 'metadata.deletionTimestamp');

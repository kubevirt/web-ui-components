import { find, get } from 'lodash';

export const getMachineNode = (nodes, machine) =>
  find(nodes, node => get(node, 'metadata.name') === get(machine, 'status.nodeRef.name'));

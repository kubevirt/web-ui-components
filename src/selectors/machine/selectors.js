import { get } from 'lodash';

export const getMachineRole = machine => get(machine, ['metadata', 'labels', 'sigs.k8s.io/cluster-api-machine-role']);

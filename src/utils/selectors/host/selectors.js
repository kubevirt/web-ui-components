import { get } from 'lodash';

export const getHostStatus = host => get(host, ['metadata', 'labels', 'metalkube.org/operational-status']);

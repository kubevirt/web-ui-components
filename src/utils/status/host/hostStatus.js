import {
  getOperationalStatus,
  getProvisioningState,
  getHostErrorMessage,
  isNodeUnschedulable,
  getMachineNode,
} from '../../../selectors';

import {
  HOST_STATUS_TO_TEXT,
  HOST_STATUS_READY,
  HOST_STATUS_REGISTERING,
  HOST_STATUS_STARTING_MAINTENANCE,
} from './constants';
import { NOT_HANDLED } from '../common';

const isStartingMaintenance = node => {
  if (isNodeUnschedulable(node)) {
    return {
      status: HOST_STATUS_STARTING_MAINTENANCE,
      text: HOST_STATUS_TO_TEXT[HOST_STATUS_STARTING_MAINTENANCE],
    };
  }
  return NOT_HANDLED;
};

const useBaremetalHostStatus = host => {
  const operationalStatus = getOperationalStatus(host);
  const provisioningState = getProvisioningState(host);

  const hostStatus = provisioningState || operationalStatus || HOST_STATUS_REGISTERING;
  return {
    status: hostStatus,
    text: HOST_STATUS_TO_TEXT[hostStatus] || hostStatus,
    errorMessage: getHostErrorMessage(host),
  };
};

export const getHostStatus = (host, machine, nodes) => {
  const node = getMachineNode(nodes, machine);

  // TODO(jtomasek): make this more robust by including node/machine status
  return isStartingMaintenance(node) || useBaremetalHostStatus(host);
};

export const getSimpleHostStatus = host => getHostStatus(host).status;

export const canHostAddMachine = host => [HOST_STATUS_READY].includes(getSimpleHostStatus(host));
export const canHostStartMaintenance = hostNode => hostNode && !isNodeUnschedulable(hostNode);
export const canHostStopMaintenance = hostNode => isNodeUnschedulable(hostNode);

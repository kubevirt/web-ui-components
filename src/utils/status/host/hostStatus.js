import { getOperationalStatus, getProvisioningState } from '../../../selectors';

import { HOST_STATUS_TO_TEXT, HOST_STATUS_READY } from './constants';

export const getHostStatus = host => {
  // Returns a status string based on the available host information.
  const operationalStatus = getOperationalStatus(host);
  const provisioningState = getProvisioningState(host);

  const hostStatus = provisioningState || operationalStatus;
  return {
    status: hostStatus,
    text: HOST_STATUS_TO_TEXT[hostStatus] || hostStatus,
    errorMessage: host.status.errorMessage,
  };
};

export const getSimpleHostStatus = host => getHostStatus(host).status;

export const canHostAddMachine = host => [HOST_STATUS_READY].includes(getSimpleHostStatus(host));

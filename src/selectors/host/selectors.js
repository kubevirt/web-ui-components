import { get } from 'lodash';

export const getOperationalStatus = host => get(host, 'status.operationalStatus');
export const getProvisioningState = host => get(host, 'status.provisioning.state');
export const getHostMachineName = host => get(host, 'spec.machineRef.name');
export const getHostBmcAddress = host => get(host, 'spec.bmc.address');
export const getHostErrorMessage = host => get(host, 'status.errorMessage');
export const isHostPoweredOn = host => get(host, 'status.poweredOn', false);

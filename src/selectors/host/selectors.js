import { get, reduce } from 'lodash';

export const getOperationalStatus = host => get(host, 'status.operationalStatus');
export const getProvisioningState = host => get(host, 'status.provisioning.state');
export const getHostMachineName = host => get(host, 'spec.machineRef.name');
export const getHostBmcAddress = host => get(host, 'spec.bmc.address');
export const isHostOnline = host => get(host, 'spec.online', false);
export const getHostNics = host => get(host, 'status.hardware.nics', []);
export const getHostStorage = host => get(host, 'status.hardware.storage', []);
export const getHostCpus = host => get(host, 'status.hardware.cpus', []);
export const getHostRam = host => get(host, 'status.hardware.ramGiB');
export const getHostErrorMessage = host => get(host, 'status.errorMessage');
export const getHostDescription = host => get(host, 'spec.description', '');
export const isHostPoweredOn = host => get(host, 'status.poweredOn', false);
export const getHostTotalStorageCapacity = host => reduce(getHostStorage(host), (sum, disk) => sum + disk.sizeGiB, 0);

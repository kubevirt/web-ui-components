import { get } from 'lodash';

export const getOperationalStatus = host => get(host, 'status.operationalStatus');
export const getProvisioningState = host => get(host, 'status.provisioning.state');

export const getHostRole = hostMachine =>
  get(hostMachine, ['metadata', 'labels', 'machine.openshift.io/cluster-api-machine-role']);

export const getHostMachineName = host => get(host, 'spec.machineRef.name');

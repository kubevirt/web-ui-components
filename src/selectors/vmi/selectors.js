import { get } from 'lodash';

export const isVmiRunning = vmi => get(vmi, 'status.phase') === 'Running';

export const getVmiIpAddresses = vmi =>
  get(vmi, 'status.interfaces', [])
    // get IPs only for named interfaces because Windows reports IPs for other devices like Loopback Pseudo-Interface 1 etc.
    .filter(i => i.name)
    .map(i => i.ipAddress)
    .filter(ip => ip && ip.trim().length > 0);

export const getHostname = vmi => get(vmi, 'spec.hostname');

export const isGuestAgentConnected = vmi =>
  get(vmi, 'status.conditions', []).some(
    condition => condition.type === 'AgentConnected' && condition.status === 'True'
  );

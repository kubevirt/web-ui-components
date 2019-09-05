import { get, uniq, flatMap } from 'lodash';

export const isVmiRunning = vmi => get(vmi, 'status.phase') === 'Running';

export const getVmiIpAddresses = vmi =>
  uniq(
    flatMap(
      // get IPs only for named interfaces because Windows reports IPs for other devices like Loopback Pseudo-Interface 1 etc.
      get(vmi, 'status.interfaces', []).filter(i => i.name),
      i => {
        const arr = [];
        if (i.ipAddress) {
          // the "ipAddress" is deprecated but still can contain useful value
          arr.push(i.ipAddress.trim());
        }
        if (i.ipAddresses && Array.isArray(i.ipAddresses) && i.ipAddresses.length > 0) {
          arr.push(...i.ipAddresses.map(ip => ip.trim()));
        }
        return arr;
      }
    ).filter(ip => ip && ip.length > 0)
  );

export const getHostname = vmi => get(vmi, 'spec.hostname');

export const isGuestAgentConnected = vmi =>
  get(vmi, 'status.conditions', []).some(
    condition => condition.type === 'AgentConnected' && condition.status === 'True'
  );

import { getVmiIpAddresses } from '../selectors';
import { cloudInitTestVmi } from '../../k8s/mock_vmi/cloudInitTestVmi.mock';

describe('getVmiIpAddresses()', () => {
  it('returns multiple IP addresses correctly', () => {
    const expectedIpAddresses = ['172.17.0.15', '172.17.0.16', '172.17.0.17'];
    expect(getVmiIpAddresses(cloudInitTestVmi)).toEqual(expectedIpAddresses);
  });

  it('returns a single IP address correctly', () => {
    const defaultInterface = cloudInitTestVmi.status.interfaces[0];
    cloudInitTestVmi.status.interfaces = [defaultInterface];
    const expectedIpAddresses = ['172.17.0.15'];
    expect(getVmiIpAddresses(cloudInitTestVmi)).toEqual(expectedIpAddresses);
  });

  it('handles zero IP addresses correctly', () => {
    delete cloudInitTestVmi.status.interfaces;
    expect(getVmiIpAddresses(cloudInitTestVmi)).toHaveLength(0);
  });

  it('removes empty and missing IP addresses', () => {
    cloudInitTestVmi.status.interfaces = [
      { ipAddress: '172.17.0.15', mac: '02:42:ac:11:00:0d', name: 'default' },
      { ipAddress: '', mac: '02:42:ac:11:00:0c', name: 'nic-1' },
      { ipAddress: ' ', mac: '02:42:ac:11:00:0e', name: 'nic-2' },
      { mac: '02:42:ac:11:00:0f', name: 'nic-3' },
    ];
    expect(getVmiIpAddresses(cloudInitTestVmi)).toHaveLength(1);
  });
});

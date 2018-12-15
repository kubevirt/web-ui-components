import { cloudInitTestVmi } from '../../../../k8s/mock_vmi/cloudInitTestVmi.vmi';
import { getVmIpAddresses } from '../VmDetails';

describe('getVmIpAddresses()', () => {
  it('returns multiple IP addresses correctly', () => {
    const expectedIpAddresses = ['172.17.0.15', '172.17.0.16', '172.17.0.17'];
    expect(getVmIpAddresses(cloudInitTestVmi)).toEqual(expectedIpAddresses);
  });

  it('returns a single IP address correctly', () => {
    const defaultInterface = cloudInitTestVmi.status.interfaces[0];
    cloudInitTestVmi.status.interfaces = [defaultInterface];
    const expectedIpAddresses = ['172.17.0.15'];
    expect(getVmIpAddresses(cloudInitTestVmi)).toEqual(expectedIpAddresses);
  });

  it('handles zero IP addresses correctly', () => {
    delete cloudInitTestVmi.status.interfaces;
    expect(getVmIpAddresses(cloudInitTestVmi)).toHaveLength(0);
  });
});

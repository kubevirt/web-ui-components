import React from 'react';

import { render } from 'enzyme';

import { cloudInitTestVmi } from '../../../../k8s/mock_vmi/cloudInitTestVmi.vmi';
import { getVmIpAddresses } from '../VmDetails';
import { VmDetails } from '../index';
import { vmFixtures } from '../fixtures/VmDetails.fixture';

describe('<VmDetails vm NodeLink />', () => {
  it('renders correctly', () => {
    const component = render(<VmDetails vm={vmFixtures.downVm} NodeLink={() => true} />);
    expect(component).toMatchSnapshot();
  });

  it('renders on status correctly', () => {
    const component = render(<VmDetails vm={vmFixtures.runningVm} NodeLink={() => true} />);
    expect(component).toMatchSnapshot();
  });

  it('renders off status correctly', () => {
    const component = render(<VmDetails vm={vmFixtures.downVm} NodeLink={() => true} />);
    expect(component).toMatchSnapshot();
  });
});

describe('VmDetails with description', () => {
  it('renders description correctly', () => {
    const component = render(<VmDetails vm={vmFixtures.vmWithDescription} NodeLink={() => true} />);
    expect(component).toMatchSnapshot();
  });
});

describe('VmDetails with labels', () => {
  it('renders values from labels correctly', () => {
    const component = render(<VmDetails vm={vmFixtures.vmWithLabels} NodeLink={() => true} />);
    expect(component).toMatchSnapshot();
  });
});

describe('VmDetails for VM with Custom flavor', () => {
  it('renders CPU and Memory settings for VM with custom flavor', () => {
    const component = render(<VmDetails vm={vmFixtures.customVm} NodeLink={() => true} />);
    expect(component).toMatchSnapshot();
  });

  it('does not render CPU and Memory settings for VM without custom flavor', () => {
    const component = render(<VmDetails vm={vmFixtures.vmWithSmallFlavor} NodeLink={() => true} />);
    expect(component).toMatchSnapshot();
  });
});

describe('<VmDetails vm vmi NodeLink />', () => {
  it('renders IP addresses correctly', () => {
    const component = render(<VmDetails vm={vmFixtures.runningVm} NodeLink={() => true} vmi={cloudInitTestVmi} />);
    expect(component).toMatchSnapshot();
  });
});

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

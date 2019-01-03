import React from 'react';
import { render } from 'enzyme';
import { cloudInitTestVmi } from '../../../../k8s/mock_vmi/cloudInitTestVmi.vmi';
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

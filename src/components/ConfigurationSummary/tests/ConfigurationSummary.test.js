import React from 'react';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';

import { ConfigurationSummary } from '..';

import { default as ConfigurationSummaryFixture } from '../fixtures/ConfigurationSummary.fixture';
import { cloudInitTestVm } from '../../../k8s/mock_vm/cloudInitTestVm.mock';
import { fullVm } from '../../../k8s/mock_vm/vm.mock';

const testConfigurationSummary = (vm = cloudInitTestVm) => (
  <ConfigurationSummary {...ConfigurationSummaryFixture.props} vm={vm} />
);

describe('<ConfigurationSummary />', () => {
  it('renders correctly', () => {
    const component = shallow(testConfigurationSummary());
    expect(component).toMatchSnapshot();
  });
  it('renders correctly with disks', () => {
    const component = shallow(testConfigurationSummary(fullVm));
    expect(component).toMatchSnapshot();
  });
  it('renders correctly without flavor details', () => {
    const vmNoFlavor = cloneDeep(cloudInitTestVm);
    delete vmNoFlavor.spec.template.spec.domain.cpu;
    delete vmNoFlavor.spec.template.spec.domain.resources;
    const component = shallow(testConfigurationSummary(vmNoFlavor));
    expect(component).toMatchSnapshot();
  });
});

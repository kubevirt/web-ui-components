import React from 'react';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';

import { default as ConfigurationSummaryFixture } from '../fixtures/ConfigurationSummary.fixture';
import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';
import { fullVm } from '../../../tests/mocks/vm/vm.mock';

import { ConfigurationSummary } from '..';

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

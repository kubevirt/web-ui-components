import React from 'react';
import { shallow, render, mount } from 'enzyme';

import { TopConsumers, TopConsumersConnected } from '../TopConsumers';
import { default as TopConsumersFixtures } from '../fixtures/TopConsumers.fixture';
import { selectDropdownItem } from '../../../../tests/enzyme';
import { PODS_AND_VMS, BY_MEMORY, BY_STORAGE, BY_NETWORK, NODES, BY_CPU } from '../strings';
import { ConsumerItem } from '../../../Dashboard/TopConsumers/ConsumerItem';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';

// eslint-disable-next-line react/prop-types
const testTopConsumersOverview = ({ props }) => <TopConsumers {...props} />;

const getTypeDropdown = component => component.find('#type-dropdown');
const getSortByDropdown = component => component.find('#sort-by-dropdown');

const testConsumerResults = (component, type, sortBy, description) => {
  selectDropdownItem(getTypeDropdown(component), type);
  selectDropdownItem(getSortByDropdown(component), sortBy);
  const consumerItems = component.find(ConsumerItem);
  consumerItems.forEach((cItem, index) => {
    expect(cItem.props().description.startsWith(description)).toBeTruthy();
  });
};

describe('<TopConsumers />', () => {
  TopConsumersFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testTopConsumersOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('switches between metrics', () => {
    const component = mount(testTopConsumersOverview(TopConsumersFixtures[0]));
    // default metric is workload sorted by CPU
    const consumerItems = component.find(ConsumerItem);
    consumerItems.forEach((cItem, index) => {
      expect(cItem.props().description.startsWith('workload-cpu')).toBeTruthy();
    });

    testConsumerResults(component, PODS_AND_VMS, BY_MEMORY, 'workload-mem');
    testConsumerResults(component, PODS_AND_VMS, BY_STORAGE, 'workload-storage');
    testConsumerResults(component, PODS_AND_VMS, BY_NETWORK, 'workload-net');

    testConsumerResults(component, NODES, BY_CPU, 'infra-cpu');
    testConsumerResults(component, NODES, BY_MEMORY, 'infra-mem');
    testConsumerResults(component, NODES, BY_STORAGE, 'infra-storage');
    testConsumerResults(component, NODES, BY_NETWORK, 'infra-net');
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[0].props}>
        <TopConsumersConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

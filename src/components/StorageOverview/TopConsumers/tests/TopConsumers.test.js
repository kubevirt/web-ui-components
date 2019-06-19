import React from 'react';
import { shallow, mount } from 'enzyme';

import TopConsumersConnected, { TopConsumers, TopConsumersBody } from '../TopConsumers';
import { default as TopConsumersFixtures } from '../fixtures/TopConsumers.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';
import { selectDropdownItem } from '../../../../tests/enzyme';

import { PROJECTS, STORAGE_CLASSES, PODS, VMS, BY_USED_CAPACITY, BY_REQUESTED_CAPACITY } from '../strings';

// eslint-disable-next-line react/prop-types
const testTopConsumersOverview = ({ props }) => <TopConsumers {...props} />;

const getTypeDropdown = component => component.find('#metric-type');
const getSortByDropdown = component => component.find('#sort-by');

const testConsumerResults = (component, type, sortBy) => {
  selectDropdownItem(getTypeDropdown(component), type);
  selectDropdownItem(getSortByDropdown(component), sortBy);
  const consumerBody = component.find(TopConsumersBody);

  expect(consumerBody.props().metricType).toBe(type);
  expect(consumerBody.props().sortByOption.name).toBe(sortBy);
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
    // default metric is workload sorted by Projects
    const consumerBody = component.find(TopConsumersBody);
    expect(consumerBody.props().metricType).toBe(PROJECTS);

    testConsumerResults(component, PROJECTS, BY_USED_CAPACITY);
    testConsumerResults(component, PROJECTS, BY_REQUESTED_CAPACITY);
    testConsumerResults(component, STORAGE_CLASSES, BY_USED_CAPACITY);
    testConsumerResults(component, STORAGE_CLASSES, BY_REQUESTED_CAPACITY);
    testConsumerResults(component, PODS, BY_USED_CAPACITY);
    testConsumerResults(component, PODS, BY_REQUESTED_CAPACITY);
    testConsumerResults(component, VMS, BY_USED_CAPACITY);
    testConsumerResults(component, VMS, BY_REQUESTED_CAPACITY);
  });
  it('renders correctly with Provider', () => {
    const component = shallow(
      <StorageOverviewContext.Provider value={StorageOverviewFixtures[0].props}>
        <TopConsumersConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

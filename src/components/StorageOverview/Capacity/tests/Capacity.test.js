import React from 'react';
import { render, shallow, mount } from 'enzyme';

import { Capacity, CapacityConnected } from '../Capacity';
import { default as CapacityFixtures } from '../fixtures/Capacity.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';
import { selectDropdownItem } from '../../../../tests/enzyme';

import { TOTAL, CAPACITY } from '../strings';

// eslint-disable-next-line react/prop-types
const testCapacityOverview = ({ props }) => <Capacity {...props} />;

const getCapacityDropdown = component => component.find('#capacity-type');

const testCapacityResults = (component, capacity) => {
  selectDropdownItem(getCapacityDropdown(component), capacity);
  expect(component.state().capacity).toBe(capacity);
};

describe('<Capacity />', () => {
  CapacityFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testCapacityOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('switches between capacity dropdown options', () => {
    const component = mount(testCapacityOverview(CapacityFixtures[0]));
    expect(component.state().capacity).toBe(TOTAL);
    testCapacityResults(component, CAPACITY);
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={StorageOverviewFixtures[0].props}>
        <CapacityConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

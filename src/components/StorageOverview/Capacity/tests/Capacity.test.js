import React from 'react';
import { render, shallow } from 'enzyme';

import { Capacity, CapacityConnected } from '../Capacity';
import { default as CapacityFixtures } from '../fixtures/Capacity.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';

// eslint-disable-next-line react/prop-types
const testCapacityOverview = ({ props }) => <Capacity {...props} />;

describe('<Capacity />', () => {
  CapacityFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testCapacityOverview(fixture));
      expect(component).toMatchSnapshot();
    });
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

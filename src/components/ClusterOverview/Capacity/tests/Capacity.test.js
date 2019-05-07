import React from 'react';
import { render, shallow } from 'enzyme';

import { Capacity, CapacityConnected } from '../Capacity';
import { default as CapacityFixtures } from '../fixtures/Capacity.fixture';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';

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
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[0].props}>
        <CapacityConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

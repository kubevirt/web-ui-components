import React from 'react';
import { shallow, render } from 'enzyme';

import { Utilization, UtilizationConnected } from '../Utilization';
import { default as UtilizationFixtures } from '../fixtures/Utilization.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';

// eslint-disable-next-line react/prop-types
const testUtilizationOverview = ({ props }) => <Utilization {...props} />;

describe('<Utilization />', () => {
  UtilizationFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testUtilizationOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[0].props}>
        <UtilizationConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

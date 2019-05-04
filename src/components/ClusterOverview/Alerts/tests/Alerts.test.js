import React from 'react';
import { shallow, render } from 'enzyme';

import { Alerts, AlertsConnected } from '../Alerts';
import { default as AlertsFixtures } from '../fixtures/Alerts.fixture';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';

// eslint-disable-next-line react/prop-types
const testAlerts = ({ props }) => <Alerts {...props} />;

describe('<Alerts />', () => {
  AlertsFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testAlerts(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[3].props}>
        <AlertsConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

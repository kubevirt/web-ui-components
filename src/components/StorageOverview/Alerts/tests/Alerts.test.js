import React from 'react';
import { shallow, render } from 'enzyme';

import { Alerts, AlertsConnected } from '../Alerts';
import { default as AlertsFixtures } from '../fixtures/Alerts.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';

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
      <StorageOverviewContext.Provider value={AlertsFixtures[0].props}>
        <AlertsConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

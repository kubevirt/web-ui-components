import React from 'react';
import { shallow } from 'enzyme';

import { Alerts } from '../Alerts';
import { default as AlertsFixtures } from '../fixtures/Alerts.fixture';

const testAlerts = () => <Alerts {...AlertsFixtures.props} />;

describe('<Alerts />', () => {
  it('renders correctly', () => {
    const component = shallow(testAlerts());
    expect(component).toMatchSnapshot();
  });
});

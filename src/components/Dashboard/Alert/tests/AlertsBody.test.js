import React from 'react';
import { shallow } from 'enzyme';

import { AlertsBody } from '../AlertsBody';
import { default as AlertsBodyFixtures } from '../fixtures/AlertsBody.fixture';

const testAlertsBody = () => <AlertsBody {...AlertsBodyFixtures.props} />;

describe('<AlertsBody />', () => {
  it('renders correctly', () => {
    const component = shallow(testAlertsBody());
    expect(component).toMatchSnapshot();
  });
});

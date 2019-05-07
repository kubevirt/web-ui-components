import React from 'react';
import { shallow } from 'enzyme';

import DashboardCardBody from '../DashboardCardBody';
import { default as DashboardCardBodyFixtures } from '../fixtures/DashboardCardBody.fixture';

// eslint-disable-next-line react/prop-types
const testDashboardCardBody = ({ props }) => <DashboardCardBody {...props}>content</DashboardCardBody>;

describe('<DashboardCardBody />', () => {
  DashboardCardBodyFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testDashboardCardBody(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

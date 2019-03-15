import React from 'react';
import { shallow } from 'enzyme';

import DashboardCardBody from '../DashboardCardBody';

const testDashboardCardBody = (isLoading = false) => (
  <DashboardCardBody isLoading={isLoading}>content</DashboardCardBody>
);

describe('<DashboardCardBody />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardCardBody());
    expect(component).toMatchSnapshot();
  });
  it('renders loading correctly', () => {
    const component = shallow(testDashboardCardBody(true));
    expect(component).toMatchSnapshot();
  });
});

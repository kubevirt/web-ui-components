import React from 'react';
import { shallow } from 'enzyme';

import DashboardCardHeader from '../DashboardCardHeader';

const testDashboardCardHeader = () => <DashboardCardHeader>content</DashboardCardHeader>;

describe('<DashboardCardHeader />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardCardHeader());
    expect(component).toMatchSnapshot();
  });
});

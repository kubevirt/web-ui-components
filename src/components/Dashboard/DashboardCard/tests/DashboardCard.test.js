import React from 'react';
import { shallow } from 'enzyme';

import DashboardCard from '../DashboardCard';

const testDashboardCard = () => <DashboardCard>content</DashboardCard>;

describe('<DashboardCard />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardCard());
    expect(component).toMatchSnapshot();
  });
});

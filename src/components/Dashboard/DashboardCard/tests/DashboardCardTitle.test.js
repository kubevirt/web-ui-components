import React from 'react';
import { shallow } from 'enzyme';

import DashboardCardTitle from '../DashboardCardTitle';

const testDashboardCardTitle = () => <DashboardCardTitle>content</DashboardCardTitle>;

describe('<DashboardCardTitle />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardCardTitle());
    expect(component).toMatchSnapshot();
  });
});

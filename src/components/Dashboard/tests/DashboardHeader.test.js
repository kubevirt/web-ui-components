import React from 'react';
import { shallow } from 'enzyme';

import DashboardHeader from '../DashboardHeader';

const testDashboardHeader = () => <DashboardHeader>content</DashboardHeader>;

describe('<DashboardHeader />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardHeader());
    expect(component).toMatchSnapshot();
  });
});

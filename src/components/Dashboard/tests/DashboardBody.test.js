import React from 'react';
import { shallow } from 'enzyme';

import DashboardBody from '../DashboardBody';

const testDashboardBody = () => <DashboardBody>content</DashboardBody>;

describe('<DashboardBody />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardBody());
    expect(component).toMatchSnapshot();
  });
});

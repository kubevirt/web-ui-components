import React from 'react';
import { shallow } from 'enzyme';

import Dashboard from '../Dashboard';

const testDashboard = () => <Dashboard>content</Dashboard>;

describe('<Dashboard />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboard());
    expect(component).toMatchSnapshot();
  });
});

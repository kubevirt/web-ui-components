import React from 'react';
import { shallow } from 'enzyme';

import DashboardCardTitleHelp from '../DashboardCardTitleHelp';

const testDashboardCardTitleHelp = () => <DashboardCardTitleHelp>content</DashboardCardTitleHelp>;

describe('<DashboardCardTitleHelp />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardCardTitleHelp());
    expect(component).toMatchSnapshot();
  });
});

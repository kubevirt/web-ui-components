import React from 'react';
import { shallow } from 'enzyme';

import { DashboardCardTitleSeeAll } from '../DashboardCardTitleSeeAll';

const testDashboardCardTitleSeeAll = () => <DashboardCardTitleSeeAll>content</DashboardCardTitleSeeAll>;

describe('<DashboardCardTitleSeeAll />', () => {
  it('renders correctly', () => {
    const component = shallow(testDashboardCardTitleSeeAll());
    expect(component).toMatchSnapshot();
  });
});

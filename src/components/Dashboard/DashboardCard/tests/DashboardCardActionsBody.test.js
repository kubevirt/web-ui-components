import React from 'react';
import { render } from 'enzyme';

import { DashboardCardActionsBody } from '../DashboardCardActionsBody';
import { Dropdown } from '../../../Form/Dropdown';
import { default as dropdownFixture } from '../../../Form/fixtures/Dropdown.fixture';

const testDashboardCardActionsBody = () => (
  <DashboardCardActionsBody>
    <Dropdown {...dropdownFixture[0].props} />
  </DashboardCardActionsBody>
);

describe('<DashboardCardActionsBody />', () => {
  it('renders correctly', () => {
    const component = render(testDashboardCardActionsBody());
    expect(component).toMatchSnapshot();
  });
});

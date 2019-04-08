import React from 'react';
import { mount } from 'enzyme';

import Dashboard from '../Dashboard';
import DashboardBody from '../DashboardBody';
import DashboardCard from '../DashboardCard/DashboardCard';
import DashboardCardHeader from '../DashboardCard/DashboardCardHeader';
import DashboardCardTitle from '../DashboardCard/DashboardCardTitle';
import DashboardCardTitleHelp from '../DashboardCard/DashboardCardTitleHelp';
import DashboardCardBody from '../DashboardCard/DashboardCardBody';

const testDashboard = () => (
  <Dashboard>
    <DashboardBody>
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>Red Card</DashboardCardTitle>
          <DashboardCardTitleHelp>Red Card help</DashboardCardTitleHelp>
        </DashboardCardHeader>
        <DashboardCardBody isLoading>Red card content</DashboardCardBody>
      </DashboardCard>
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>Blue Card</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardBody>Blue card content</DashboardCardBody>
      </DashboardCard>
    </DashboardBody>
  </Dashboard>
);

describe('<Dashboard /> API', () => {
  it('renders correctly', () => {
    const component = mount(testDashboard());
    expect(component).toMatchSnapshot();
  });
});

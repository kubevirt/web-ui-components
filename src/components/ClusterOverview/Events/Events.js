import React from 'react';

import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleHelp,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';

export const Events = ({ Component }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster Events</DashboardCardTitle>
      <DashboardCardTitleHelp>help for events</DashboardCardTitleHelp>
    </DashboardCardHeader>
    <DashboardCardBody id="events-body" className="kubevirt-events__body">
      <Component />
    </DashboardCardBody>
  </DashboardCard>
);
Events.defaultProps = {
  Component: React.Fragment,
};

Events.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const EventsConnected = () => <ClusterOverviewContextGenericConsumer Component={Events} dataPath="eventsData" />;

export default EventsConnected;

import React from 'react';

import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleHelp,
} from '../../Dashboard/DashboardCard';
import EventsBody from '../../Dashboard/Events/EventsBody';
import { StorageOverviewContextGenericConsumer } from '../StorageOverviewContext';

export const Events = ({ Component }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Events</DashboardCardTitle>
      <DashboardCardTitleHelp>help for events</DashboardCardTitleHelp>
    </DashboardCardHeader>
    <DashboardCardBody>
      <EventsBody id="events-body">
        <Component />
      </EventsBody>
    </DashboardCardBody>
  </DashboardCard>
);
Events.defaultProps = {
  Component: React.Fragment,
};

Events.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const EventsConnected = () => <StorageOverviewContextGenericConsumer Component={Events} dataPath="eventsData" />;

export default EventsConnected;

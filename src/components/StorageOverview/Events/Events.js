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
import { StorageOverviewContext } from '../StorageOverviewContext';

export const Events = ({ EventStreamComponent }) => (
  <DashboardCard>
    <DashboardCardHeader className="kubevirt-events__card-header">
      <DashboardCardTitle>Events</DashboardCardTitle>
      <DashboardCardTitleHelp>help for events</DashboardCardTitleHelp>
    </DashboardCardHeader>
    <DashboardCardBody id="events-body" className="kubevirt-events__card-body">
      <EventsBody>
        <EventStreamComponent />
      </EventsBody>
    </DashboardCardBody>
  </DashboardCard>
);

Events.propTypes = {
  EventStreamComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

const EventsConnected = () => (
  <StorageOverviewContext.Consumer>{props => <Events {...props} />}</StorageOverviewContext.Consumer>
);

export default EventsConnected;

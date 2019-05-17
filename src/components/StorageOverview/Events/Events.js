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

export class Events extends React.PureComponent {
  render() {
    const { EventStreamComponent } = this.props;
    return (
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
  }
}

Events.propTypes = {
  EventStreamComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const EventsConnected = () => (
  <StorageOverviewContext.Consumer>
    {props => <Events EventStreamComponent={props.EventStreamComponent} />}
  </StorageOverviewContext.Consumer>
);

EventsConnected.propTypes = {
  ...Events.propTypes,
};

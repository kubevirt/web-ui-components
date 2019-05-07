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
import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';

export class Events extends React.PureComponent {
  render() {
    const { Component } = this.props;
    return (
      <DashboardCard>
        <DashboardCardHeader className="kubevirt-events__card-header">
          <DashboardCardTitle>Cluster Events</DashboardCardTitle>
          <DashboardCardTitleHelp>help for events</DashboardCardTitleHelp>
        </DashboardCardHeader>
        <DashboardCardBody id="events-body" className="kubevirt-events__card-body">
          <EventsBody>
            <Component />
          </EventsBody>
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}
Events.defaultProps = {
  Component: React.Fragment,
};

Events.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const EventsConnected = () => <ClusterOverviewContextGenericConsumer Component={Events} dataPath="eventsData" />;

EventsConnected.propTypes = {
  ...Events.propTypes,
};

EventsConnected.defaultProps = {
  ...Events.defaultProps,
};

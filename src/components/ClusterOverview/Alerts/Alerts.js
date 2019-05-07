import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { AlertsBody } from '../../Dashboard/Alert/AlertsBody';
import { filterAlerts } from './utils';
import { AlertItem } from '../../Dashboard/Alert/AlertItem';

export class Alerts extends React.PureComponent {
  render() {
    const { alertsResponse, className } = this.props;
    if (!Array.isArray(alertsResponse)) {
      return null;
    }

    const alerts = filterAlerts(alertsResponse);

    return alerts.length > 0 ? (
      <DashboardCard className={className}>
        <DashboardCardHeader>
          <DashboardCardTitle>Alerts</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardBody>
          <AlertsBody>
            {alerts.map((alert, index) => (
              <AlertItem key={`alert-${index}`} alert={alert} />
            ))}
          </AlertsBody>
        </DashboardCardBody>
      </DashboardCard>
    ) : null;
  }
}

Alerts.propTypes = {
  alertsResponse: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  className: PropTypes.string,
};

Alerts.defaultProps = {
  alertsResponse: null,
  className: null,
};

export const AlertsConnected = ({ className }) => (
  <ClusterOverviewContext.Consumer>
    {props => <Alerts alertsResponse={props.alertsResponse} className={className} />}
  </ClusterOverviewContext.Consumer>
);

AlertsConnected.propTypes = {
  ...Alerts.propTypes,
};

AlertsConnected.defaultProps = {
  ...Alerts.defaultProps,
};

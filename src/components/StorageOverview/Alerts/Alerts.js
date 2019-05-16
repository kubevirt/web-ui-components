import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'patternfly-react';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { DashboardCardActionsBody } from '../../Dashboard/DashboardCard/DashboardCardActionsBody';
import { Dropdown } from '../../Form/Dropdown';

import { StorageOverviewContext } from '../StorageOverviewContext';
import { AlertsBody } from '../../Dashboard/Alert/AlertsBody';
import { filterAlerts } from './utils';
import { AlertItem } from '../../Dashboard/Alert/AlertItem';
import { getAlertSeverity } from '../../../selectors/prometheus/alerts';
import { ALL, WARNING, CRITICAL } from '../../Dashboard/strings';

const alertsFilterOptions = [ALL, CRITICAL, WARNING];

export class Alerts extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: ALL,
    };
  }

  filterBy = (allAlerts, filter) => allAlerts.filter(alert => getAlertSeverity(alert) === filter);

  getAlerts = allAlerts => {
    switch (this.state.type) {
      case ALL:
        return allAlerts;
      case WARNING:
        return this.filterBy(allAlerts, 'warning');
      case CRITICAL:
        return this.filterBy(allAlerts, 'critical');
      default:
        return [];
    }
  };

  render() {
    const { alertsResponse, className } = this.props;

    if (!Array.isArray(alertsResponse)) {
      return null;
    }
    const allAlerts = filterAlerts(alertsResponse);

    if (allAlerts.length === 0) {
      return null;
    }
    const alerts = this.getAlerts(allAlerts);
    const isLoading = !alerts;
    return (
      <DashboardCard className={className}>
        <DashboardCardHeader>
          <Row>
            <Col lg={9} md={9} sm={9} xs={9}>
              <DashboardCardTitle>Alerts</DashboardCardTitle>
            </Col>
            <Col lg={3} md={3} sm={3} xs={3}>
              <DashboardCardActionsBody>
                <Dropdown
                  id="alert-type"
                  value={this.state.type}
                  choices={alertsFilterOptions}
                  onChange={newVal => this.setState({ type: newVal })}
                  disabled={isLoading}
                />
              </DashboardCardActionsBody>
            </Col>
          </Row>
        </DashboardCardHeader>
        <DashboardCardBody>
          <AlertsBody>
            {alerts.map((alert, index) => (
              <AlertItem key={`alert-${index}`} alert={alert} />
            ))}
          </AlertsBody>
        </DashboardCardBody>
      </DashboardCard>
    );
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
  <StorageOverviewContext.Consumer>
    {props => <Alerts alertsResponse={props.alertsResponse} className={className} />}
  </StorageOverviewContext.Consumer>
);

AlertsConnected.propTypes = {
  ...Alerts.propTypes,
};

AlertsConnected.defaultProps = {
  ...Alerts.defaultProps,
};

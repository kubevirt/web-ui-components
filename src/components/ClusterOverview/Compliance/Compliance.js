import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { HealthBody } from '../../Dashboard/Health/HealthBody';
import { HealthItem, LOADING_STATE, OK_STATE, ERROR_STATE } from '../../Dashboard/Health/HealthItem';

export class Compliance extends React.PureComponent {
  render() {
    const { complianceData, LoadingComponent } = this.props;
    let complianceState;
    if (!complianceData) {
      complianceState = { state: LOADING_STATE };
    } else {
      const compliaceIsOk = get(complianceData, 'result') === 'ok';
      complianceState = {
        state: compliaceIsOk ? OK_STATE : ERROR_STATE,
        message: compliaceIsOk ? 'All nodes compliant' : 'Error occured',
      };
    }

    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>Cluster Compliance</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardBody>
          <HealthBody>
            <HealthItem
              state={complianceState.state}
              message={complianceState.message}
              LoadingComponent={LoadingComponent}
            />
          </HealthBody>
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}

Compliance.defaultProps = {
  LoadingComponent: InlineLoading,
  complianceData: null,
};

Compliance.propTypes = {
  complianceData: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const ComplianceConnected = () => (
  <ClusterOverviewContext.Consumer>
    {props => <Compliance complianceData={props.complianceData} LoadingComponent={props.LoadingComponent} />}
  </ClusterOverviewContext.Consumer>
);

ComplianceConnected.propTypes = {
  ...Compliance.propTypes,
};

ComplianceConnected.defaultProps = {
  ...Compliance.defaultProps,
};

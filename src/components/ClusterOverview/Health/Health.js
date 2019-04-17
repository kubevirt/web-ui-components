import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleSeeAll,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { SubsystemHealth } from '../../SubsystemHealth';
import { HealthItem, OK_STATE, ERROR_STATE, WARNING_STATE } from '../../Dashboard/Health/HealthItem';
import { HealthBody } from '../../Dashboard/Health/HealthBody';
import { getK8sHealthState, getKubevirtHealthState, getOCSHealthState } from '../../Dashboard/Health/utils';

const getClusterHealth = subsystemStates => {
  let healthState = { state: OK_STATE, message: 'Cluster is healthy' };
  const sortedStates = {
    errorStates: [],
    warningStates: [],
  };

  subsystemStates.forEach(state => {
    switch (state.state) {
      case ERROR_STATE:
        sortedStates.errorStates.push(state);
        break;
      case WARNING_STATE:
        sortedStates.warningStates.push(state);
        break;
      default:
        break;
    }
  });

  if (sortedStates.errorStates.length > 1) {
    healthState = { state: ERROR_STATE, message: 'Multiple errors', details: 'Cluster health is degrated' };
  } else if(sortedStates.errorStates.length === 1) {
    healthState = sortedStates.errorStates[0];
  } else if (sortedStates.warningStates.length > 1) {
    healthState = { state: WARNING_STATE, message: 'Multiple warnings', details: 'Cluster health is degrated' };
  } else if (sortedStates.warningStates.length === 1) {
    healthState = sortedStates.warningStates[0];
  }

  return healthState;
};

export const Health = ({ k8sHealth, kubevirtHealth, cephHealth, LoadingComponent }) => {
  const k8sHealthState = getK8sHealthState(k8sHealth);
  const kubevirtHealthState = getKubevirtHealthState(kubevirtHealth);
  const cephHealthState = getOCSHealthState(cephHealth);

  const healthState = getClusterHealth([k8sHealthState, kubevirtHealthState, cephHealthState]);

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Health</DashboardCardTitle>
        <DashboardCardTitleSeeAll>
          <SubsystemHealth
            k8sHealth={k8sHealthState}
            kubevirtHealth={kubevirtHealthState}
            cephHealth={cephHealthState}
            LoadingComponent={LoadingComponent}
          />
        </DashboardCardTitleSeeAll>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={!(k8sHealth && kubevirtHealth && cephHealth)} LoadingComponent={LoadingComponent}>
        <HealthBody>
          <HealthItem state={healthState.state} message={healthState.message} details={healthState.details}/>
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

Health.defaultProps = {
  k8sHealth: null,
  kubevirtHealth: null,
  cephHealth: null,
  LoadingComponent: InlineLoading,
};

Health.propTypes = {
  k8sHealth: PropTypes.object,
  kubevirtHealth: PropTypes.object,
  cephHealth: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const HealthConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <Health {...props} />}</ClusterOverviewContext.Consumer>
);

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
import { SubsystemHealth } from '../../Dashboard/SubsystemHealth';
import { HealthItem, OK_STATE, ERROR_STATE, WARNING_STATE, LOADING_STATE } from '../../Dashboard/Health/HealthItem';
import { HealthBody } from '../../Dashboard/Health/HealthBody';
import { getK8sHealthState, getKubevirtHealthState, getOCSHealthState } from '../../Dashboard/Health/utils';

const getClusterHealth = subsystemStates => {
  let healthState = { state: OK_STATE, message: 'Cluster is healthy' };
  const sortedStates = {
    errorStates: [],
    warningStates: [],
    loadingStates: [],
  };

  subsystemStates.forEach(state => {
    switch (state.state) {
      case ERROR_STATE:
        sortedStates.errorStates.push(state);
        break;
      case WARNING_STATE:
        sortedStates.warningStates.push(state);
        break;
      case LOADING_STATE:
        sortedStates.loadingStates.push(state);
        break;
      default:
        break;
    }
  });

  if (sortedStates.loadingStates.length > 0) {
    healthState = { state: LOADING_STATE };
  } else if (sortedStates.errorStates.length > 0) {
    healthState =
      sortedStates.errorStates.length === 1
        ? sortedStates.errorStates[0]
        : { state: ERROR_STATE, message: 'Multiple errors', details: 'Cluster health is degrated' };
  } else if (sortedStates.warningStates.length > 0) {
    healthState =
      sortedStates.warningStates.length === 1
        ? sortedStates.warningStates[0]
        : { state: WARNING_STATE, message: 'Multiple warnings', details: 'Cluster health is degrated' };
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
        <DashboardCardTitleSeeAll title="Subsystem health">
          <SubsystemHealth
            k8sHealth={k8sHealthState}
            kubevirtHealth={kubevirtHealthState}
            cephHealth={cephHealthState}
            LoadingComponent={LoadingComponent}
          />
        </DashboardCardTitleSeeAll>
      </DashboardCardHeader>
      <DashboardCardBody>
        <HealthBody>
          <HealthItem
            state={healthState.state}
            message={healthState.message}
            details={healthState.details}
            LoadingComponent={LoadingComponent}
          />
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

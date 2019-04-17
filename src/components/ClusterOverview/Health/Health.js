import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

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
import { HealthItem, OK_STATE, ERROR_STATE, WARNING_STATE, LOADING_STATE } from '../../Dashboard/Health/HealthItem';
import { getOCSHealthStatus } from '../../StorageOverview/OCSHealth/Health';
import { HealthBody } from '../../Dashboard/Health/HealthBody';

const getKubevirtHealthState = kubevirtHealth => {
  if (!kubevirtHealth) {
    return {state: LOADING_STATE}
  }
  return get(kubevirtHealth, 'apiserver.connectivity') === 'ok' ?
  {message: 'CNV is healthy', state: OK_STATE} : {message: 'CNV is in error state', state: ERROR_STATE};
}

const getK8sHealthState = k8sHealth => {
  if (!k8sHealth) {
    return {state: LOADING_STATE}
  }
  return get(k8sHealth, 'response') === 'ok' ?
    {message: 'OpenShift is healthy', state: OK_STATE} : {message: 'Openshift is in error state', state: ERROR_STATE};
}

export const Health = ({ k8sHealth, kubevirtHealth, cephHealth, LoadingComponent }) => {
  const k8sHealthState = getK8sHealthState(k8sHealth);
  const kubevirtHealthState = getKubevirtHealthState(kubevirtHealth);
  const cepthHealthState = getOCSHealthStatus(cephHealth);

  let healthState = {state: OK_STATE, message: 'Cluster is healthy'};
  [k8sHealthState, kubevirtHealthState, cepthHealthState].forEach(health => {
    if (healthState.state !== ERROR_STATE && health.state === ERROR_STATE) {
      healthState = health;
    } else if (healthState.state !== WARNING_STATE && health.state === WARNING_STATE) {
      healthState = health;
    }
  });

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Health</DashboardCardTitle>
        <DashboardCardTitleSeeAll>
          <SubsystemHealth k8sHealth={k8sHealthState} kubevirtHealth={kubevirtHealthState} cephHealth={cepthHealthState} LoadingComponent={LoadingComponent} />
        </DashboardCardTitleSeeAll>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={!(k8sHealth && kubevirtHealth && cephHealth)} LoadingComponent={LoadingComponent}>
        <HealthBody>
          <HealthItem state={healthState.state} message={healthState.message}/>
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

Health.defaultProps = {
  k8sHealth: null,
  kubevirtHealth: null,
  cepthHealth: null,
  LoadingComponent: InlineLoading,
};

Health.propTypes = {
  k8sHealth: PropTypes.object,
  kubevirtHealth: PropTypes.object,
  cepthHealth: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const HealthConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <Health {...props} />}</ClusterOverviewContext.Consumer>
);

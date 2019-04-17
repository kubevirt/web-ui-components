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
import { HealthItem, OK_STATE, ERROR_STATE, WARNING_STATE } from '../../Dashboard/Health/HealthItem';
import { HealthBody } from '../../Dashboard/Health/HealthBody';
import { getK8sHealthState, getKubevirtHealthState, getOCSHealthState } from '../../Dashboard/Health/utils';

const getClusterHealth = (k8sHealthState, kubevirtHealthState, cephHealthState) => {
  let healthState = {state: OK_STATE, message: 'Cluster is healthy'};
  [k8sHealthState, kubevirtHealthState, cephHealthState].forEach(health => {
    if (healthState.state !== ERROR_STATE && health.state === ERROR_STATE) {
      healthState = health;
    } else if (healthState.state !== WARNING_STATE && health.state === WARNING_STATE) {
      healthState = health;
    }
  });
  return healthState
}

export const Health = ({ k8sHealth, kubevirtHealth, cephHealth, LoadingComponent }) => {
  const k8sHealthState = getK8sHealthState(k8sHealth);
  const kubevirtHealthState = getKubevirtHealthState(kubevirtHealth);
  const cephHealthState = getOCSHealthState(cephHealth);

  const healthState = getClusterHealth(k8sHealthState, kubevirtHealthState, cephHealthState)

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
          <HealthItem state={healthState.state} message={healthState.message} />
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

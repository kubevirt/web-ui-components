import React from 'react';
import PropTypes from 'prop-types';

import { DashboardCard, DashboardCardBody, DashboardCardHeader, DashboardCardTitle } from '../Dashboard/DashboardCard';
import { HealthItem } from '../Dashboard/Health/HealthItem';
import { HealthBody } from '../Dashboard/Health/HealthBody';

import { InlineLoading } from '../Loading';

export const SubsystemHealth = ({ k8sHealth, kubevirtHealth, cephHealth, LoadingComponent }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Subsystem health</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <HealthBody>
        <HealthItem
          message={'OpenShift'}
          details={k8sHealth.message}
          state={k8sHealth.state}
          LoadingComponent={LoadingComponent}
        />
          <HealthItem
          message={'CNV'}
          details={kubevirtHealth.message}
          state={kubevirtHealth.state}
          LoadingComponent={LoadingComponent}
        />
        <HealthItem
          message={'Ceph'}
          details={cephHealth.message}
          state={cephHealth.state}
          LoadingComponent={LoadingComponent}
        />
      </HealthBody>
    </DashboardCardBody>
  </DashboardCard>
);

SubsystemHealth.defaultProps = {
  k8sHealth: null,
  kubevirtHealth: null,
  cepthHealth: null,
  LoadingComponent: InlineLoading,
};

SubsystemHealth.propTypes = {
  k8sHealth: PropTypes.object,
  kubevirtHealth: PropTypes.object,
  cepthHealth: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

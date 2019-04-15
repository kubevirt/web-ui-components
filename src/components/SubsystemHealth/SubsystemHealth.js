import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { DashboardCard, DashboardCardBody, DashboardCardHeader, DashboardCardTitle } from '../Dashboard/DashboardCard';
import { StorageOverviewContextGenericConsumer } from '../StorageOverview/StorageOverviewContext';
import { HealthItem } from '../Dashboard/Health/HealthItem';
import { HealthBody } from '../Dashboard/Health/HealthBody';

import { InlineLoading } from '../Loading';

const HealthStatus = {
  0: {
    details: 'is healthy',
    iconname: 'check-circle',
    classname: 'ok',
  },
  1: {
    details: 'health is degraded',
    iconname: 'exclamation-circle',
    classname: 'warning',
  },
  2: {
    details: 'health is degraded',
    iconname: 'exclamation-triangle',
    classname: 'error',
  },
  3: {
    details: 'health data is not available',
    iconname: 'exclamation-triangle',
    classname: 'error',
  },
};

export const SubsystemHealth = ({ data, loaded }) => {
  const value = {
    ocp: get(data, 'ocp.healthy'),
    cnv: get(data, 'cnv.healthy'),
    ceph: get(data, 'ceph.healthy'),
  };

  const status = {
    ocp: HealthStatus[value.ocp] || HealthStatus[3],
    cnv: HealthStatus[value.cnv] || HealthStatus[3],
    ceph: HealthStatus[value.ceph] || HealthStatus[3],
  };

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Subsystem health</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <HealthBody>
          <HealthItem
            message={data ? 'OpenShift' : null}
            details={data ? `OpenShift ${status.ocp.details}` : null}
            icon={data ? status.ocp.iconname : null}
            classname={data ? status.ocp.classname : null}
            isLoading={!loaded}
            LoadingComponent={InlineLoading}
          />
          <HealthItem
            message={data ? 'CNV' : null}
            details={data ? `CNV ${status.cnv.details}` : null}
            icon={data ? status.cnv.iconname : null}
            classname={data ? status.cnv.classname : null}
            isLoading={!loaded}
            LoadingComponent={InlineLoading}
            isRow
          />
          <HealthItem
            message={data ? 'Ceph Storage' : null}
            details={data ? `Ceph Storage ${status.ceph.details}` : null}
            icon={data ? status.ceph.iconname : null}
            classname={data ? status.ceph.classname : null}
            isLoading={!loaded}
            LoadingComponent={InlineLoading}
            isRow
          />
        </HealthBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

SubsystemHealth.defaultProps = {
  loaded: false,
};

SubsystemHealth.propTypes = {
  data: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

const SubsystemHealthConnected = () => (
  <StorageOverviewContextGenericConsumer Component={SubsystemHealth} dataPath="healthData" />
);

export default SubsystemHealthConnected;

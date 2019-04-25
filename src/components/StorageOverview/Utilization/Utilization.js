import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext';
import { InlineLoading } from '../../Loading';
import { UtilizationBody } from '../../Dashboard/Utilization/UtilizationBody';
import { UtilizationItem } from '../../Dashboard/Utilization/UtilizationItem';
import { getUtilizationVectorStats } from '../../../selectors';
import { formatBytes } from '../../../utils';

const getUtilizationData = data => {
  let stats = null;
  let maxValueConverted;

  const statsRaw = getUtilizationVectorStats(data);
  if (statsRaw) {
    const maxValue = Math.max(0, ...statsRaw);
    maxValueConverted = formatBytes(maxValue);
    stats = statsRaw.map(bytes => formatBytes(bytes, maxValueConverted.unit, 1).value);
  } else {
    maxValueConverted = formatBytes(0);
    stats = null;
  }

  return {
    unit: `${maxValueConverted.unit}/s`,
    values: stats,
    maxValue: Number(maxValueConverted.value.toFixed(1)),
  };
};

export const Utilization = ({
  iopsUtilization,
  latencyUtilization,
  throughputUtilization,
  recoveryRateUtilization,
  LoadingComponent,
}) => {
  const throughputData = getUtilizationData(throughputUtilization);
  const recoveryRateData = getUtilizationData(recoveryRateUtilization);

  const iopsStats = getUtilizationVectorStats(iopsUtilization);
  let iopsStatsMax = 0;
  if (iopsStats) {
    iopsStatsMax = Math.ceil(Math.max(0, ...iopsStats));
  }
  const latencyStats = getUtilizationVectorStats(latencyUtilization);
  let latencyStatsMax = 0;
  if (latencyStats) {
    latencyStatsMax = Math.max(0, ...latencyStats);
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Performance</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <UtilizationBody>
          <UtilizationItem
            unit={throughputData.unit}
            id="throughput"
            title="Throughput"
            data={throughputData.values}
            maxY={throughputData.maxValue}
            decimalPoints={1}
            LoadingComponent={LoadingComponent}
            isLoading={!throughputUtilization}
          />
          <UtilizationItem
            unit="IOPS"
            id="iops"
            title="IOPS"
            data={iopsStats}
            maxY={iopsStatsMax}
            decimalPoints={0}
            LoadingComponent={LoadingComponent}
            isLoading={!iopsUtilization}
          />
          <UtilizationItem
            unit="ms"
            id="latency"
            title="Latency"
            data={latencyStats}
            maxY={latencyStatsMax}
            decimalPoints={1}
            LoadingComponent={LoadingComponent}
            isLoading={!latencyUtilization}
          />
          <UtilizationItem
            unit={recoveryRateData.unit}
            id="recoveryRate"
            title="Recovery rate"
            data={recoveryRateData.values}
            maxY={recoveryRateData.maxValue}
            decimalPoints={1}
            LoadingComponent={LoadingComponent}
            isLoading={!recoveryRateUtilization}
          />
        </UtilizationBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

Utilization.defaultProps = {
  iopsUtilization: null,
  latencyUtilization: null,
  throughputUtilization: null,
  recoveryRateUtilization: null,
  LoadingComponent: InlineLoading,
};

Utilization.propTypes = {
  iopsUtilization: PropTypes.object,
  latencyUtilization: PropTypes.object,
  throughputUtilization: PropTypes.object,
  recoveryRateUtilization: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const UtilizationConnected = () => (
  <StorageOverviewContext.Consumer>{props => <Utilization {...props} />}</StorageOverviewContext.Consumer>
);

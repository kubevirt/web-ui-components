import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { UtilizationBody } from '../../Dashboard/Utilization/UtilizationBody';
import { UtilizationItem } from '../../Dashboard/Utilization/UtilizationItem';
import { getCapacityStats, getUtilizationVectorStats } from '../../../selectors';
import { formatBytes } from '../../../utils';

const getMemoryData = (memoryUtilization, memoryTotal) => {
  let memoryStats;
  let maxValueConverted;

  const memoryStatsRaw = getUtilizationVectorStats(memoryUtilization);
  if (memoryStatsRaw) {
    const maxValue = Math.min(Math.max(...memoryStatsRaw) * 2, getCapacityStats(memoryTotal));
    maxValueConverted = formatBytes(maxValue, undefined, 1);
    memoryStats = memoryStatsRaw.map(bytes => formatBytes(bytes, maxValueConverted.unit, 1).value);
  } else {
    maxValueConverted = formatBytes(0); // 0 B
    memoryStats = null;
  }

  return {
    unit: maxValueConverted.unit,
    values: memoryStats,
    maxValue: maxValueConverted.value,
  };
};

export const Utilization = ({
  cpuUtilization,
  memoryUtilization,
  memoryTotal,
  storageTotal,
  storageUsed,
  LoadingComponent,
}) => {
  const cpuStats = getUtilizationVectorStats(cpuUtilization);
  const memoryData = getMemoryData(memoryUtilization, memoryTotal);
  const storageUsageData = getMemoryData(storageUsed, storageTotal);

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Utilization</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <UtilizationBody>
          <UtilizationItem
            unit="%"
            id="cpu"
            title="CPU"
            data={cpuStats}
            maxY={100}
            LoadingComponent={LoadingComponent}
            isLoading={!cpuUtilization}
          />
          <UtilizationItem
            unit={memoryData.unit}
            id="memory"
            title="Memory"
            data={memoryData.values}
            maxY={memoryData.maxValue}
            LoadingComponent={LoadingComponent}
            isLoading={!(memoryUtilization && memoryTotal)}
          />
          <UtilizationItem
            unit={storageUsageData.unit}
            id="diskUsage"
            title="Disk Usage"
            data={storageUsageData.values}
            maxY={storageUsageData.maxValue}
            LoadingComponent={LoadingComponent}
            isLoading={!(storageUsed && storageTotal)}
          />
        </UtilizationBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

Utilization.defaultProps = {
  cpuUtilization: null,
  memoryUtilization: null,
  memoryTotal: null,
  storageTotal: null,
  storageUsed: null,
  LoadingComponent: InlineLoading,
};

Utilization.propTypes = {
  cpuUtilization: PropTypes.object,
  memoryUtilization: PropTypes.object,
  memoryTotal: PropTypes.object,
  storageTotal: PropTypes.object,
  storageUsed: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const UtilizationConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <Utilization {...props} />}</ClusterOverviewContext.Consumer>
);

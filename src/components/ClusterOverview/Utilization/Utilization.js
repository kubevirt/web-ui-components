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
import { formatBytes, formatNetTraffic } from '../../../utils';

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

const getThroughputData = iorw => {
  let iorwStats;
  let maxValueConverted;

  const iorwRaw = getUtilizationVectorStats(iorw);
  if (iorwRaw) {
    const maxValue = Math.max(...iorwRaw);
    maxValueConverted = formatNetTraffic(maxValue, undefined, 1);
    iorwStats = iorwRaw.map(rws => formatNetTraffic(rws, maxValueConverted.unit, 1).value);
  } else {
    maxValueConverted = formatNetTraffic(0); // 0 Bps
    iorwStats = null;
  }

  return {
    unit: maxValueConverted.unit,
    values: iorwStats,
    maxValue: maxValueConverted.value,
  };
};

export class Utilization extends React.PureComponent {
  render() {
    const {
      cpuUtilization,
      memoryUtilization,
      memoryTotal,
      storageTotal,
      storageUsed,
      storageIORW,
      LoadingComponent,
    } = this.props;
    const cpuStats = getUtilizationVectorStats(cpuUtilization);
    const memoryData = getMemoryData(memoryUtilization, memoryTotal);
    const storageUsageData = getMemoryData(storageUsed, storageTotal);
    const diskIORWData = getThroughputData(storageIORW);

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
              unit={diskIORWData.unit}
              id="diskIORW"
              title="Disk IO R/W"
              data={diskIORWData.values}
              maxY={diskIORWData.maxValue}
              LoadingComponent={LoadingComponent}
              isLoading={!storageIORW}
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
  }
}

Utilization.defaultProps = {
  cpuUtilization: null,
  memoryUtilization: null,
  memoryTotal: null,
  storageTotal: null,
  storageUsed: null,
  storageIORW: null,
  LoadingComponent: InlineLoading,
};

Utilization.propTypes = {
  cpuUtilization: PropTypes.object,
  memoryUtilization: PropTypes.object,
  memoryTotal: PropTypes.object,
  storageTotal: PropTypes.object,
  storageUsed: PropTypes.object,
  storageIORW: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const UtilizationConnected = () => (
  <ClusterOverviewContext.Consumer>
    {props => (
      <Utilization
        cpuUtilization={props.cpuUtilization}
        memoryUtilization={props.memoryUtilization}
        memoryTotal={props.memoryTotal}
        storageTotal={props.storageTotal}
        storageUsed={props.storageUsed}
        storageIORW={props.storageIORW}
        LoadingComponent={props.LoadingComponent}
      />
    )}
  </ClusterOverviewContext.Consumer>
);

UtilizationConnected.propTypes = {
  ...Utilization.propTypes,
};

UtilizationConnected.defaultProps = {
  ...Utilization.defaultProps,
};

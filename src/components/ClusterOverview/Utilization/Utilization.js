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

export class Utilization extends React.PureComponent {
  render() {
    const { cpuUtilization, memoryUtilization, memoryTotal, LoadingComponent } = this.props;
    const cpuStats = getUtilizationVectorStats(cpuUtilization);

    let memoryStats = null;
    let memoryTotalConverted;
    let memoryMax = 0;
    let maxConverted;
    const memoryStatsRaw = getUtilizationVectorStats(memoryUtilization);
    if (memoryStatsRaw) {
      memoryMax = Math.max(0, ...memoryStatsRaw);
      maxConverted = formatBytes(memoryMax);
      memoryStats = memoryStatsRaw.map(bytes => formatBytes(bytes, maxConverted.unit, 1).value);
      memoryTotalConverted = memoryTotal
        ? formatBytes(getCapacityStats(memoryTotal), maxConverted.unit, 1).value
        : undefined;
    } else {
      maxConverted = formatBytes(memoryMax); // B
    }

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
              unit={maxConverted.unit}
              id="memory"
              title="Memory"
              data={memoryStats}
              maxY={memoryTotalConverted}
              LoadingComponent={LoadingComponent}
              isLoading={!memoryUtilization}
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
  LoadingComponent: InlineLoading,
};

Utilization.propTypes = {
  cpuUtilization: PropTypes.object,
  memoryUtilization: PropTypes.object,
  memoryTotal: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const UtilizationConnected = () => (
  <ClusterOverviewContext.Consumer>
    {props => (
      <Utilization
        cpuUtilization={props.cpuUtilization}
        LoadingComponent={props.LoadingComponent}
        memoryUtilization={props.memoryUtilization}
        memoryTotal={props.memoryTotal}
      />
    )}
  </ClusterOverviewContext.Consumer>
);

UtilizationConnected.defaultProps = {
  ...Utilization.defaultProps,
};

UtilizationConnected.propTypes = {
  ...Utilization.propTypes,
};

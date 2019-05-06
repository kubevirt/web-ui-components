import React from 'react';
import PropTypes from 'prop-types';

import { InlineLoading } from '../../Loading';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { CapacityItem } from '../../Dashboard/Capacity/CapacityItem';
import { formatBytes, formatPercents, formatNetTraffic } from '../../../utils';
import { getCapacityStats, getLastUtilizationStat } from '../../../selectors';
import { CapacityBody } from '../../Dashboard/Capacity/CapacityBody';

export class Capacity extends React.PureComponent {
  render() {
    const {
      cpuUtilization,
      memoryTotal,
      memoryUtilization,
      storageTotal,
      storageUsed,
      networkTotal,
      networkUsed,
      LoadingComponent,
    } = this.props;
    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>Cluster Capacity</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardBody>
          <CapacityBody>
            <CapacityItem
              id="cpu"
              title="CPU"
              used={getLastUtilizationStat(cpuUtilization)}
              total={100}
              formatValue={formatPercents}
              LoadingComponent={LoadingComponent}
              isLoading={!cpuUtilization}
            />
            <CapacityItem
              id="memory"
              title="Memory"
              used={getLastUtilizationStat(memoryUtilization)}
              total={getCapacityStats(memoryTotal)}
              formatValue={formatBytes}
              LoadingComponent={LoadingComponent}
              isLoading={!(memoryUtilization && memoryTotal)}
            />
            <CapacityItem
              id="storage"
              title="Storage"
              used={getLastUtilizationStat(storageUsed)}
              total={getCapacityStats(storageTotal)}
              formatValue={formatBytes}
              LoadingComponent={LoadingComponent}
              isLoading={!(storageUsed && storageTotal)}
            />
            <CapacityItem
              id="network"
              title="Network"
              used={getCapacityStats(networkUsed)}
              total={getCapacityStats(networkTotal)}
              formatValue={formatNetTraffic}
              LoadingComponent={LoadingComponent}
              isLoading={!(networkUsed && networkTotal)}
            />
          </CapacityBody>
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}

Capacity.defaultProps = {
  cpuUtilization: null,
  memoryTotal: null,
  memoryUtilization: null,
  storageTotal: null,
  storageUsed: null,
  networkTotal: null,
  networkUsed: null,
  LoadingComponent: InlineLoading,
};

Capacity.propTypes = {
  cpuUtilization: PropTypes.object,
  memoryTotal: PropTypes.object,
  memoryUtilization: PropTypes.object,
  storageTotal: PropTypes.object,
  storageUsed: PropTypes.object,
  networkTotal: PropTypes.object,
  networkUsed: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const CapacityConnected = () => (
  <ClusterOverviewContext.Consumer>
    {props => (
      <Capacity
        cpuUtilization={props.cpuUtilization}
        memoryTotal={props.memoryTotal}
        memoryUtilization={props.memoryUtilization}
        storageTotal={props.storageTotal}
        storageUsed={props.storageUsed}
        networkTotal={props.networkTotal}
        networkUsed={props.networkUsed}
        LoadingComponent={props.LoadingComponent}
      />
    )}
  </ClusterOverviewContext.Consumer>
);

CapacityConnected.propTypes = {
  ...Capacity.propTypes,
};

CapacityConnected.defaultProps = {
  ...Capacity.defaultProps,
};

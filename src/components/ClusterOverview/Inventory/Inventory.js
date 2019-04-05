import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleHelp,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import {
  mapNodesToProps,
  mapPodsToProps,
  mapPvcsToProps,
  mapVmsToProps,
  mapHostsToProps,
  mapDiskStatsToProps,
} from '../../Dashboard/Inventory/utils';
import { InventoryRow } from '../../Dashboard/Inventory/InventoryRow';
import { InlineLoading } from '../../Loading';

const InventoryBody = ({ nodes, pods, vms, vmis, pvcs, migrations, hosts, diskStats, LoadingComponent }) => (
  <React.Fragment>
    <InventoryRow title="Nodes" {...mapNodesToProps(nodes)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="Hosts" {...mapHostsToProps(hosts)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="PVCs" {...mapPvcsToProps(pvcs)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="Pods" {...mapPodsToProps(pods)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="VMs" {...mapVmsToProps(vms, pods, migrations)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="Disks" {...mapDiskStatsToProps(diskStats)} LoadingComponent={LoadingComponent} />
  </React.Fragment>
);

InventoryBody.defaultProps = {
  nodes: undefined,
  pods: undefined,
  vms: undefined,
  vmis: undefined,
  pvcs: undefined,
  migrations: undefined,
  hosts: undefined,
  LoadingComponent: InlineLoading,
};

InventoryBody.propTypes = {
  nodes: PropTypes.array,
  pods: PropTypes.array,
  vms: PropTypes.array,
  vmis: PropTypes.array,
  pvcs: PropTypes.array,
  migrations: PropTypes.array,
  hosts: PropTypes.array,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const Inventory = props => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster inventory</DashboardCardTitle>
      <DashboardCardTitleHelp>help for inventory</DashboardCardTitleHelp>
    </DashboardCardHeader>
    <DashboardCardBody>
      <InventoryBody {...props} />
    </DashboardCardBody>
  </DashboardCard>
);

Inventory.defaultProps = {
  ...InventoryBody.defaultProps,
};

Inventory.propTypes = {
  ...InventoryBody.propTypes,
};

export const InventoryConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <Inventory {...props} />}</ClusterOverviewContext.Consumer>
);

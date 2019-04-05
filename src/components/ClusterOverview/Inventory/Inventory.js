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
import { mapNodesToProps, mapPodsToProps, mapPvcsToProps, mapVmsToProps, mapHostsToProps } from './utils';
import { InventoryRow } from '../../Dashboard/Inventory/InventoryRow';

const InventoryBody = ({ nodes, pods, vms, vmis, pvcs, migrations, hosts }) => (
  <React.Fragment>
    <InventoryRow title="Nodes" {...mapNodesToProps(nodes)} />
    <InventoryRow title="Hosts" {...mapHostsToProps(hosts)} />
    <InventoryRow title="PVCs" {...mapPvcsToProps(pvcs)} />
    <InventoryRow title="Pods" {...mapPodsToProps(pods)} />
    <InventoryRow title="VMs" {...mapVmsToProps(vms, pods, migrations)} />
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
};

InventoryBody.propTypes = {
  nodes: PropTypes.array,
  pods: PropTypes.array,
  vms: PropTypes.array,
  vmis: PropTypes.array,
  pvcs: PropTypes.array,
  migrations: PropTypes.array,
  hosts: PropTypes.array,
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

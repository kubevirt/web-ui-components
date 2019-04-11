import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleHelp,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext';
import { mapNodesToProps, mapPvcsToProps, mapPvsToProps } from '../../Dashboard/Inventory/utils';
import diskStatsToProps from './diskInventoryUtils';
import { InventoryRow } from '../../Dashboard/Inventory/InventoryRow';
import { InlineLoading } from '../../Loading';

const InventoryBody = ({ nodes, pvs, pvcs, diskStats, LoadingComponent }) => (
  <React.Fragment>
    <InventoryRow title="Nodes" {...mapNodesToProps(nodes)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="Disks" {...diskStatsToProps(diskStats)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="PVs" {...mapPvsToProps(pvs)} LoadingComponent={LoadingComponent} />
    <InventoryRow title="PVCs" {...mapPvcsToProps(pvcs)} LoadingComponent={LoadingComponent} />
  </React.Fragment>
);

InventoryBody.defaultProps = {
  nodes: undefined,
  diskStats: undefined,
  pvs: undefined,
  pvcs: undefined,
  LoadingComponent: InlineLoading,
};

InventoryBody.propTypes = {
  nodes: PropTypes.array,
  diskStats: PropTypes.object,
  pvs: PropTypes.array,
  pvcs: PropTypes.array,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const Inventory = props => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Inventory</DashboardCardTitle>
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
  <StorageOverviewContext.Consumer>{props => <Inventory {...props} />}</StorageOverviewContext.Consumer>
);

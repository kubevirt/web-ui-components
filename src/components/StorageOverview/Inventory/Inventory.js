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

const InventoryBody = ({ nodes, pvs, pvcs, diskStats }) => (
  <React.Fragment>
    <InventoryRow title="Nodes" {...mapNodesToProps(nodes)} />
    <InventoryRow title="Disks" {...diskStatsToProps(diskStats)} />
    <InventoryRow title="PVs" {...mapPvsToProps(pvs)} />
    <InventoryRow title="PVCs" {...mapPvcsToProps(pvcs)} />
  </React.Fragment>
);

InventoryBody.defaultProps = {
  nodes: undefined,
  diskStats: undefined,
  pvs: undefined,
  pvcs: undefined,
};

InventoryBody.propTypes = {
  nodes: PropTypes.array,
  diskStats: PropTypes.object,
  pvs: PropTypes.array,
  pvcs: PropTypes.array,
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

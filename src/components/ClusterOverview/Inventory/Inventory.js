import React from 'react';
import PropTypes from 'prop-types';
import { Col, Icon } from 'patternfly-react';

import { getNodeErrorStatuses } from './nodeStatus';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleHelp,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';

const InventoryItemStatus = ({ item }) => {
  let ok = true;
  if (item.kind === 'Node') {
    ok = !item.data.some(i => getNodeErrorStatuses(i).length > 0);
  }
  return ok ? (
    <div className="kubevirt-inventory__item-status">
      <Icon type="fa" name="check-circle" size="2x" className="kubevirt-inventory__item-status-icon" />
      <span>{item.data.length}</span>
    </div>
  ) : (
    <div>
      <span className="glyphicon glyphicon-remove-circle" />
    </div>
  );
};

InventoryItemStatus.propTypes = {
  item: PropTypes.object.isRequired,
};

const InventoryBody = ({ inventory }) =>
  Object.keys(inventory).map(key => {
    const item = inventory[key];
    return (
      <div key={key} className="kubevirt-inventory__item">
        <Col lg={9} md={9} sm={9} xs={9}>
          {item.data.length} {item.title}
        </Col>
        <Col lg={3} md={3} sm={3} xs={3}>
          <InventoryItemStatus item={item} />
        </Col>
      </div>
    );
  });

InventoryBody.propTypes = {
  inventory: PropTypes.object.isRequired,
};

export const Inventory = ({ inventory, loaded }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster inventory</DashboardCardTitle>
      <DashboardCardTitleHelp>help for inventory</DashboardCardTitleHelp>
    </DashboardCardHeader>
    <DashboardCardBody className="kubevirt-inventory__body" isLoading={!loaded}>
      <InventoryBody inventory={inventory} />
    </DashboardCardBody>
  </DashboardCard>
);

Inventory.defaultProps = {
  loaded: false,
};

Inventory.propTypes = {
  inventory: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

const InventoryConnected = () => (
  <ClusterOverviewContextGenericConsumer Component={Inventory} dataPath="inventoryData" />
);

export default InventoryConnected;

import React from 'react';
import PropTypes from 'prop-types';

import { InlineLoading } from '../../Loading';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext';
import { CapacityItem } from '../../Dashboard/Capacity/CapacityItem';
import { formatBytes } from '../../../utils';
import { getCapacityStats } from '../../../selectors';
import { CapacityBody } from '../../Dashboard/Capacity/CapacityBody';

export const Capacity = ({ capacityTotal, capacityUsed, LoadingComponent }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Capacity</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <CapacityBody>
        <CapacityItem
          id="capacity"
          title="Total capacity"
          used={getCapacityStats(capacityUsed)}
          total={getCapacityStats(capacityTotal)}
          formatValue={formatBytes}
          LoadingComponent={LoadingComponent}
          isLoading={!(capacityUsed && capacityTotal)}
        />
      </CapacityBody>
    </DashboardCardBody>
  </DashboardCard>
);

Capacity.defaultProps = {
  capacityTotal: null,
  capacityUsed: null,
  LoadingComponent: InlineLoading,
};

Capacity.propTypes = {
  capacityTotal: PropTypes.object,
  capacityUsed: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const CapacityConnected = () => (
  <StorageOverviewContext.Consumer>{props => <Capacity {...props} />}</StorageOverviewContext.Consumer>
);

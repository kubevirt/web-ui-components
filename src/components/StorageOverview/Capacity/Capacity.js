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

export const Capacity = ({ capacityTotal, capacityUsed, LoadingComponent, className }) => (
  <DashboardCard className="kubevirt-capacity__card">
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
  className: null,
};

Capacity.propTypes = {
  capacityTotal: PropTypes.object,
  capacityUsed: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  className: PropTypes.string,
};

export const CapacityConnected = ({ className }) => (
  <StorageOverviewContext.Consumer>
    {props => <Capacity {...props} className={className} />}
  </StorageOverviewContext.Consumer>
);

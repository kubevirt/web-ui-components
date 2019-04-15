import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext';
import { InlineLoading } from '../../Loading';
import { DetailItem } from '../../Dashboard/Details/DetailItem';
import { DetailsBody } from '../../Dashboard/Details/DetailsBody';
import { getName } from '../../../selectors';

export const StorageDetails = ({ LoadingComponent, cephCluster, className }) => (
  <DashboardCard className={className}>
    <DashboardCardHeader>
      <DashboardCardTitle>OCS Details</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <DetailsBody>
        <DetailItem
          key="name"
          title="Name"
          value={cephCluster && cephCluster[0] && getName(cephCluster[0])}
          isLoading={!cephCluster}
          LoadingComponent={LoadingComponent}
        />
        <DetailItem
          key="provider"
          title="Provider"
          value="Bare Metal"
          isLoading={false}
          LoadingComponent={LoadingComponent}
        />
      </DetailsBody>
    </DashboardCardBody>
  </DashboardCard>
);

StorageDetails.defaultProps = {
  cephCluster: null,
  LoadingComponent: InlineLoading,
  className: null,
};

StorageDetails.propTypes = {
  cephCluster: PropTypes.array,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  className: PropTypes.string,
};

export const StorageDetailsConnected = ({ className }) => (
  <StorageOverviewContext.Consumer>
    {props => <StorageDetails {...props} className={className} />}
  </StorageOverviewContext.Consumer>
);

StorageDetailsConnected.defaultProps = {
  className: null,
};

StorageDetailsConnected.propTypes = {
  className: PropTypes.string,
};

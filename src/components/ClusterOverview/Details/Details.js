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
import { getClusterName, getInfrastructurePlatform, getOpenshiftVersion } from '../../../selectors';
import { DetailItem } from '../../Dashboard/Details/DetailItem';
import { DetailsBody } from '../../Dashboard/Details/DetailsBody';

export const Details = ({ infrastructure, openshiftClusterVersionResponse, LoadingComponent, className }) => (
  <DashboardCard className={className}>
    <DashboardCardHeader>
      <DashboardCardTitle>Details</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody>
      <DetailsBody>
        <DetailItem
          key="name"
          title="Name"
          value={getClusterName(infrastructure)}
          isLoading={!infrastructure}
          LoadingComponent={LoadingComponent}
        />
        <DetailItem
          key="provider"
          title="Provider"
          value={getInfrastructurePlatform(infrastructure)}
          isLoading={!infrastructure}
          LoadingComponent={LoadingComponent}
        />
        <DetailItem
          key="openshift"
          title="Openshift version"
          value={getOpenshiftVersion(openshiftClusterVersionResponse)}
          isLoading={!openshiftClusterVersionResponse}
          LoadingComponent={LoadingComponent}
        />
      </DetailsBody>
    </DashboardCardBody>
  </DashboardCard>
);

Details.defaultProps = {
  infrastructure: null,
  openshiftClusterVersionResponse: null,
  LoadingComponent: InlineLoading,
  className: null,
};

Details.propTypes = {
  infrastructure: PropTypes.object,
  openshiftClusterVersionResponse: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  className: PropTypes.string,
};

export const DetailsConnected = ({ className }) => (
  <ClusterOverviewContext.Consumer>
    {props => <Details className={className} {...props} />}
  </ClusterOverviewContext.Consumer>
);

DetailsConnected.defaultProps = {
  className: null,
};

DetailsConnected.propTypes = {
  className: PropTypes.string,
};

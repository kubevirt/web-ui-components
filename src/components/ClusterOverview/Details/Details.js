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

export const Details = ({ infrastructure, openshiftClusterVersions, LoadingComponent }) => (
  <DashboardCard>
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
          key="rhhi"
          title="RHHI version"
          value="1.0" // this will be hardcoded for the demo
          isLoading={false}
          LoadingComponent={LoadingComponent}
        />
        <DetailItem
          key="openshift"
          title="Openshift version"
          value={getOpenshiftVersion(openshiftClusterVersions)}
          isLoading={!openshiftClusterVersions}
          LoadingComponent={LoadingComponent}
        />
      </DetailsBody>
    </DashboardCardBody>
  </DashboardCard>
);

Details.defaultProps = {
  infrastructure: null,
  openshiftClusterVersions: null,
  LoadingComponent: InlineLoading,
};

Details.propTypes = {
  infrastructure: PropTypes.object,
  openshiftClusterVersions: PropTypes.array,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const DetailsConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <Details {...props} />}</ClusterOverviewContext.Consumer>
);

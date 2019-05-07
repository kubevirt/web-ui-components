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

export class Details extends React.PureComponent {
  render() {
    const { infrastructure, openshiftClusterVersionResponse, LoadingComponent, className } = this.props;
    return (
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
              title="OpenShift version"
              value={getOpenshiftVersion(openshiftClusterVersionResponse)}
              isLoading={!openshiftClusterVersionResponse}
              LoadingComponent={LoadingComponent}
            />
          </DetailsBody>
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}

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
    {props => (
      <Details
        className={className}
        infrastructure={props.infrastructure}
        openshiftClusterVersionResponse={props.openshiftClusterVersionResponse}
        LoadingComponent={props.LoadingComponent}
      />
    )}
  </ClusterOverviewContext.Consumer>
);

DetailsConnected.propTypes = {
  ...Details.propTypes,
};

DetailsConnected.defaultProps = {
  ...Details.defaultProps,
};

import React from 'react';
import PropTypes from 'prop-types';

import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { getOpenshiftVersion, getClusterName, getInfrastructurePlatform } from '../../../selectors';
import { InlineLoading } from '../../Loading';
import { Details } from './Details';

export const ClusterDetails = ({ infrastructure, openshiftClusterVersions, LoadingComponent }) => {
  const items = {
    name: {
      title: 'Name',
      value: getClusterName(infrastructure),
      isLoading: !infrastructure,
    },
    provider: {
      title: 'Provider',
      value: getInfrastructurePlatform(infrastructure),
      isLoading: !infrastructure,
    },
    rhhi: {
      title: 'RHHI version',
      value: 'hardcoded-version', // this will be hardcoded for the demo
      isLoading: false,
    },
    openshift: {
      title: 'Openshift version',
      value: getOpenshiftVersion(openshiftClusterVersions),
      isLoading: !openshiftClusterVersions,
    },
  };

  return <Details items={items} heading="Details" LoadingComponent={LoadingComponent} />;
};

ClusterDetails.defaultProps = {
  infrastructure: null,
  openshiftClusterVersions: null,
  LoadingComponent: InlineLoading,
};

ClusterDetails.propTypes = {
  infrastructure: PropTypes.object,
  openshiftClusterVersions: PropTypes.array,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const ClusterDetailsConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <ClusterDetails {...props} />}</ClusterOverviewContext.Consumer>
);

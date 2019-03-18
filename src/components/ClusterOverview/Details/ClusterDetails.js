import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { Details } from './Details';

export const ClusterDetails = ({ infrastructure, openshiftVersionResponse, LoadingComponent }) => {
  const items = {
    name: {
      title: 'Name',
      value: getClusterName(infrastructure),
      isLoading: !infrastructure,
    },
    provider: {
      title: 'Provider',
      value: get(infrastructure, 'status.platform'),
      isLoading: !infrastructure,
    },
    rhhi: {
      title: 'RHHI version',
      value: 'hardcoded-version', // this will be hardcoded for the demo
      isLoading: false,
    },
    openshift: {
      title: 'Openshift version',
      value: getOpenshiftVersion(openshiftVersionResponse),
      isLoading: !openshiftVersionResponse,
    },
  };

  return <Details items={items} LoadingComponent={LoadingComponent} />;
};

ClusterDetails.defaultProps = {
  infrastructure: null,
  openshiftVersionResponse: null,
  LoadingComponent: InlineLoading,
};

ClusterDetails.propTypes = {
  infrastructure: PropTypes.object,
  openshiftVersionResponse: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const ClusterDetailsConnected = () => (
  <ClusterOverviewContextGenericConsumer Component={ClusterDetails} dataPath="detailsData" />
);

const getClusterName = infrastructure => {
  const apiServerURL = get(infrastructure, 'status.apiServerURL');
  let clusterName;
  if (apiServerURL) {
    clusterName = apiServerURL.replace('https://api.', '');
    const portIndex = clusterName.indexOf(':');
    if (portIndex !== -1) {
      clusterName = clusterName.slice(0, portIndex);
    }
  }
  return clusterName;
};

const getOpenshiftVersion = openshiftVersionResponse => {
  const result = get(openshiftVersionResponse, 'data.result');
  let version;
  if (result) {
    // if cluster has more nodes, we take the version for the fist one
    const item = Array.isArray(result) ? result[0] : result;
    version = get(item, 'metric.gitVersion');
  }
  return version;
};

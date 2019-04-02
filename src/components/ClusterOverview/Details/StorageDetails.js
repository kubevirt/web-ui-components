import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { Details } from './Details';

export const StorageDetails = ({ LoadingComponent, storageCluster }) => {
  const items = {
    name: {
      title: 'Name',
      value: storageCluster && storageCluster.length ? getClusterName(storageCluster) : null,
      isLoading: !storageCluster,
    },
    provider: {
      title: 'Provider',
      value: 'Ceph', // this will be hardcoded for the demo
      isLoading: false,
    },
    ocs: {
      title: 'OCS version',
      value: 'v4.2', // this will be hardcoded for the demo
      isLoading: false,
    },
  };
  return <Details items={items} heading="OCS Details" LoadingComponent={LoadingComponent} />;
};

const getClusterName = storageCluster => {
  const clusterName = get(storageCluster[0], 'metadata.name');
  return clusterName;
};

export const StorageDetailsConnected = () => (
  <ClusterOverviewContextGenericConsumer Component={StorageDetails} dataPath="detailsData" />
);

StorageDetails.defaultProps = {
  storageCluster: null,
  LoadingComponent: InlineLoading,
};

StorageDetails.propTypes = {
  storageCluster: PropTypes.array,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

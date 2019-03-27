import React from 'react';
import PropTypes from 'prop-types';

import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { Details } from './Details';

export const StorageDetails = ({LoadingComponent }) => {
  const items = {
    name: {
      title: 'Name',
      value: 'rook-ceph',
      isLoading: false,
    },
    provider: {
      title: 'Provider',
      //value: get(infrastructure, 'status.platform'),
      value: 'Ceph',
      isLoading: false,
    },
    ocs: {
      title: 'OCS version',
      value: 'v4.2', // this will be hardcoded for the demo
      isLoading: false,
    }
  };

  return <Details items={items} LoadingComponent={LoadingComponent} />;
};

StorageDetails.defaultProps = {
  LoadingComponent: InlineLoading,
};

StorageDetails.propTypes = {
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const StorageDetailsConnected = () => (
  <ClusterOverviewContextGenericConsumer Component={StorageDetails} dataPath="detailsData" />
);

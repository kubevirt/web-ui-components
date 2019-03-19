import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { Details } from './Details';

export const StorageDetails = ({LoadingComponent }) => {
  const items = {
    name: {
      title: 'Name',
      value: 'Cluster 1',
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
      value: 'v1.0', // this will be hardcoded for the demo
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

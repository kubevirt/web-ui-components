import React from 'react';

import { StorageOverview as StorageOverviewComponent } from '../StorageOverview';
import { storageClusterDetailsData } from '../Details/fixtures/StorageDetails.fixture';
import { nodes, pvcs, pods, vms, vmis, migrations } from './ClusterOverview.fixture';

import { ClusterOverviewContext } from '../ClusterOverviewContext';

const StorageOverview = props => (
  <ClusterOverviewContext.Provider value={props}>
    <StorageOverviewComponent />
  </ClusterOverviewContext.Provider>
);

export default [
  {
    component: StorageOverview,
    props: {
      detailsData: storageClusterDetailsData,
      nodes,
      pvcs,
      pods,
      vms,
      vmis,
      migrations,
    },
  },
];

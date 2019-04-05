import React from 'react';

import { StorageOverview as StorageOverviewComponent } from '../StorageOverview';
import { cephCluster } from '../Details/fixtures/Details.fixture';
import { ocsHealthData } from '../OCSHealth/fixtures/Health.fixture';
import { capacityStats } from '../Capacity/fixtures/Capacity.fixture';

import { StorageOverviewContext } from '../StorageOverviewContext';

import { localhostNode } from '../../../tests/mocks/node';
import { persistentVolumeClaims } from '../../../tests/mocks/persistentVolumeClaim';
import { persistentVolumes } from '../../../tests/mocks/persistentVolume';

export const nodes = [localhostNode];
export const pvcs = persistentVolumeClaims;
export const pvs = persistentVolumes;

const StorageOverview = props => (
  <StorageOverviewContext.Provider value={props}>
    <StorageOverviewComponent />
  </StorageOverviewContext.Provider>
);

export default [
  {
    component: StorageOverview,
    props: {
      cephCluster,
      ocsHealthData,
      ...capacityStats,
      nodes,
      pvcs,
      pvs,
    },
  },
  {
    component: StorageOverview,
    name: 'Loading overview',
    props: {
      ocsHealthData: { loaded: false },
    },
  },
];

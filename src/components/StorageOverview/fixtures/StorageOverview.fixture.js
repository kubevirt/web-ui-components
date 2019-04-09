import React from 'react';

import { StorageOverview as StorageOverviewComponent } from '../StorageOverview';
import { cephCluster } from '../Details/fixtures/Details.fixture';
import { ocsHealthData } from '../OCSHealth/fixtures/Health.fixture';
import { eventsData } from '../Events/fixtures/Events.fixture';
import { capacityStats } from '../Capacity/fixtures/Capacity.fixture';
import { utilizationStats } from '../Utilization/fixtures/Utilization.fixture';
import { dataResiliencyData } from '../DataResiliency/fixtures/DataResiliency.fixture';

import { StorageOverviewContext } from '../StorageOverviewContext';

import { localhostNode } from '../../../tests/mocks/node';
import { persistentVolumeClaims } from '../../../tests/mocks/persistentVolumeClaim';
import { persistentVolumes } from '../../../tests/mocks/persistentVolume';
import { osdDisksCount } from '../../../tests/mocks/disks';

export const nodes = [localhostNode];
export const pvcs = persistentVolumeClaims;
export const pvs = persistentVolumes;
export const diskStats = osdDisksCount;

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
      diskStats,
      eventsData,
      ...utilizationStats,
      ...dataResiliencyData[0],
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

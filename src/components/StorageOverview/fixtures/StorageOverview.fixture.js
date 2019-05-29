import React from 'react';

import { StorageOverview as StorageOverviewComponent } from '../StorageOverview';
import { cephCluster } from '../Details/fixtures/Details.fixture';
import { ocsHealthResponse } from '../OCSHealth/fixtures/Health.fixture';
import { EventStreamComponent } from '../Events/fixtures/Events.fixture';
import { capacityStats } from '../Capacity/fixtures/Capacity.fixture';
import { utilizationStats } from '../Utilization/fixtures/Utilization.fixture';
import { dataResiliencyData } from '../DataResiliency/fixtures/DataResiliency.fixture';

import { StorageOverviewContext } from '../StorageOverviewContext';

import { localhostNode } from '../../../tests/mocks/node';
import { persistentVolumeClaims } from '../../../tests/mocks/persistentVolumeClaim';
import { persistentVolumes } from '../../../tests/mocks/persistentVolume';
import { osdDisksCount } from '../../../tests/mocks/disks';
import { cephDiskInaccessibleAlert, cephDataRecoveryAlert } from '../Alerts/fixtures/Alerts.fixture';

import { topConsumers } from '../TopConsumers/fixtures/TopConsumers.fixture';

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
      ocsHealthResponse,
      ...capacityStats,
      nodes,
      pvcs,
      pvs,
      ...osdDisksCount,
      EventStreamComponent,
      ...utilizationStats,
      ...dataResiliencyData[0],
      alertsResponse: [cephDiskInaccessibleAlert, cephDataRecoveryAlert],
      ...topConsumers,
    },
  },
  {
    component: StorageOverview,
    name: 'Loading overview',
    props: {
      EventStreamComponent,
    },
  },
];

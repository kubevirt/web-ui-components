import React from 'react';

import { ClusterOverview as ClusterOverviewComponent } from '../ClusterOverview';
import { healthData } from '../Health/fixtures/Health.fixture';
import { eventsData } from '../Events/fixtures/Events.fixture';
import { consumersData } from '../TopConsumers/fixtures/TopConsumers.fixture';
import { capacityStats, emptyCapacityStats } from '../Capacity/fixtures/Capacity.fixture';
import { clusterDetailsData } from '../Details/fixtures/ClusterDetails.fixture';

import { complianceData, utilizationStats } from '..';

import { ClusterOverviewContext } from '../ClusterOverviewContext';

import { localhostNode } from '../../../tests/mocks/node';
import { cloudInitTestPod } from '../../../tests/mocks/pod/cloudInitTestPod.mock';
import { persistentVolumeClaims } from '../../../tests/mocks/persistentVolumeClaim';
import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';
import { fullVm } from '../../../tests/mocks/vm/vm.mock';
import { cloudInitTestVmi } from '../../../tests/mocks/vmi/cloudInitTestVmi.mock';

export const nodes = [localhostNode];
export const pvcs = persistentVolumeClaims;
export const pods = [cloudInitTestPod];
export const vms = [fullVm, cloudInitTestVm];
export const vmis = [cloudInitTestVmi];
export const migrations = [];

const ClusterOverview = props => (
  <ClusterOverviewContext.Provider value={props}>
    <ClusterOverviewComponent />
  </ClusterOverviewContext.Provider>
);

export default [
  {
    component: ClusterOverview,
    props: {
      ...clusterDetailsData,
      healthData,
      capacityStats,
      complianceData,
      eventsData,
      utilizationStats,
      consumersData,
      nodes,
      pvcs,
      pods,
      vms,
      vmis,
      migrations,
    },
  },
  {
    component: ClusterOverview,
    name: 'Loading overview',
    props: {
      healthData: { loaded: false },
      capacityStats: emptyCapacityStats,
      complianceData: { loaded: false },
      eventsData: { loaded: false },
      utilizationStats: { loaded: false },
      consumersData: { loaded: false },
    },
  },
];

import React from 'react';

import { ClusterOverview as ClusterOverviewComponent } from '../ClusterOverview';
import { healthData } from '../Health/fixtures/Health.fixture';
import { eventsData } from '../Events/fixtures/Events.fixture';
import { consumersData } from '../TopConsumers/fixtures/TopConsumers.fixture';
import { inventoryData } from '../Inventory/fixtures/Inventory.fixture';
import { clusterDetailsData } from '../Details/fixtures/ClusterDetails.fixture';

import { complianceData, capacityStats, utilizationStats } from '..';

import { ClusterOverviewContext } from '../ClusterOverviewContext';

const ClusterOverview = props => (
  <ClusterOverviewContext.Provider value={props}>
    <ClusterOverviewComponent />
  </ClusterOverviewContext.Provider>
);

export default [
  {
    component: ClusterOverview,
    props: {
      detailsData: clusterDetailsData,
      healthData,
      capacityStats,
      complianceData,
      eventsData,
      utilizationStats,
      consumersData,
      inventoryData,
    },
  },
  {
    component: ClusterOverview,
    name: 'Loading overview',
    props: {
      detailsData: {},
      healthData: { loaded: false },
      capacityStats: { loaded: false },
      complianceData: { loaded: false },
      eventsData: { loaded: false },
      utilizationStats: { loaded: false },
      consumersData: { loaded: false },
      inventoryData: { loaded: false },
    },
  },
];

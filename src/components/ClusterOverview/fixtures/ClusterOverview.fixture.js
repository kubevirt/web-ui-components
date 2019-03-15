import React from 'react';

import { ClusterOverview as ClusterOverviewComponent } from '../ClusterOverview';
import { healthData } from '../Health/fixtures/Health.fixture';
import { eventsData } from '../Events/fixtures/Events.fixture';
import { consumersData } from '../TopConsumers/fixtures/TopConsumers.fixture';
import { inventoryData } from '../Inventory/fixtures/Inventory.fixture';

import { detailsData, complianceData, capacityStats, utilizationStats } from '..';

import { ClusterOverviewContext } from '../ClusterOverviewContext';

const ClusterOverview = props => (
  <ClusterOverviewContext.Provider {...props}>
    <ClusterOverviewComponent />
  </ClusterOverviewContext.Provider>
);

export default [
  {
    component: ClusterOverview,
    props: {
      detailsData,
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
      detailsData: { loaded: false },
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

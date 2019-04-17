import React from 'react';
import MediaQuery from 'react-responsive';

import { Grid, GridItem } from '@patternfly/react-core';

import { Dashboard, DashboardBody } from '../Dashboard';
import { MEDIA_QUERY_EXCLUSIVE_DEVIATION, MEDIA_QUERY_LG } from '../../utils';

import { DetailsConnected } from './Details/Details';
import { HealthConnected } from './Health/Health';
import ComplianceConnected from './Compliance/Compliance';
import EventsConnected from './Events/Events';
import { InventoryConnected } from './Inventory/Inventory';
import { CapacityConnected } from './Capacity/Capacity';
import { UtilizationConnected } from './Utilization/Utilization';
import { TopConsumersConnected } from './TopConsumers/TopConsumers';
import { AlertsConnected } from './Alerts/Alerts';

const MainCards = () => (
  <GridItem lg={6} md={12} sm={12}>
    <Grid>
      <GridItem span={12}>
        <Grid className="kubevirt-dashboard__health-grid">
          <GridItem lg={6} md={12} sm={12}>
            <HealthConnected />
          </GridItem>
          <GridItem lg={6} md={12} sm={12}>
            <ComplianceConnected />
          </GridItem>
          <GridItem span={12}>
            <AlertsConnected className="kubevirt-dashboard__card--top-border" />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem span={12}>
        <CapacityConnected />
      </GridItem>
      <GridItem span={12}>
        <UtilizationConnected />
      </GridItem>
    </Grid>
  </GridItem>
);

const LeftCards = () => (
  <GridItem key="left" lg={3} md={12} sm={12}>
    <DetailsConnected className="kubevirt-detail__card" />
    <InventoryConnected />
  </GridItem>
);

const RightCards = () => (
  <GridItem key="right" lg={3} md={12} sm={12}>
    <Grid>
      <GridItem lg={12} md={6} sm={12}>
        <EventsConnected />
      </GridItem>
      <GridItem lg={12} md={6} sm={12}>
        <TopConsumersConnected />
      </GridItem>
    </Grid>
  </GridItem>
);

export const ClusterOverview = () => (
  <Dashboard>
    <DashboardBody>
      <Grid>
        <MediaQuery key="main-medium" maxWidth={MEDIA_QUERY_LG - MEDIA_QUERY_EXCLUSIVE_DEVIATION}>
          <MainCards />
        </MediaQuery>

        <LeftCards />

        <MediaQuery key="main-large" minWidth={MEDIA_QUERY_LG}>
          <MainCards />
        </MediaQuery>

        <RightCards />
      </Grid>
    </DashboardBody>
  </Dashboard>
);

ClusterOverview.propTypes = {};

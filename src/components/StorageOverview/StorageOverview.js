import React from 'react';
import MediaQuery from 'react-responsive';

import { Grid, GridItem } from '@patternfly/react-core';

import { Dashboard, DashboardBody } from '../Dashboard';
import { MEDIA_QUERY_EXCLUSIVE_DEVIATION, MEDIA_QUERY_LG } from '../../utils';

import { StorageDetailsConnected } from './Details/Details';
import { InventoryConnected } from './Inventory/Inventory';
import OCSHealthConnected from './OCSHealth/Health';
import { CapacityConnected } from './Capacity/Capacity';
import EventsConnected from './Events/Events';

const MainCards = () => (
  <GridItem lg={6} md={12} sm={12}>
    <Grid>
      <GridItem span={12}>
        <OCSHealthConnected />
      </GridItem>
      <GridItem span={6}>
        <CapacityConnected />
      </GridItem>
    </Grid>
  </GridItem>
);

const LeftCards = () => (
  <GridItem key="left" lg={3} md={12} sm={12}>
    <Grid>
      <GridItem lg={12} md={6} sm={12}>
        <StorageDetailsConnected />
      </GridItem>
      <GridItem lg={12} md={6} sm={12}>
        <InventoryConnected />
      </GridItem>
    </Grid>
  </GridItem>
);

const RightCards = () => (
  <GridItem key="right" lg={3} md={12} sm={12}>
    <Grid>
      <GridItem lg={12} md={6} sm={12}>
        <EventsConnected />
      </GridItem>
    </Grid>
  </GridItem>
);

export const StorageOverview = () => (
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

StorageOverview.propTypes = {};

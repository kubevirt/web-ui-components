import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import MediaQuery from 'react-responsive';
import PropTypes from 'prop-types';

import { Dashboard, DashboardBody, DashboardHeader } from '../Dashboard';
import { MEDIA_QUERY_EXCLUSIVE_DEVIATION, MEDIA_QUERY_LG } from '../../utils';

import Details from './Details/Details';
import Health from './Health/Health';
import Compliance from './Compliance/Compliance';
import Events from './Events/Events';
import Inventory from './Inventory/Inventory';
import Capacity from './Capacity/Capacity';
import Utilization from './Utilization/Utilization';
import TopConsumers from './TopConsumers/TopConsumers';

export const ClusterOverview = props => {
  const mainComponent = (
    <GridItem lg={6} md={12} sm={12}>
      <Grid>
        <GridItem span={6}>
          <Health {...props.healthData} />
        </GridItem>
        <GridItem span={6}>
          <Compliance {...props.complianceData} />
        </GridItem>
        <GridItem span={12}>
          <Capacity {...props.capacityStats} />
        </GridItem>
        <GridItem span={12}>
          <Utilization {...props.utilizationStats} />
        </GridItem>
      </Grid>
    </GridItem>
  );

  return (
    <Dashboard>
      <DashboardHeader>Cluster Dashboard</DashboardHeader>
      <DashboardBody>
        <Grid>
          <MediaQuery key="main-medium" maxWidth={MEDIA_QUERY_LG - MEDIA_QUERY_EXCLUSIVE_DEVIATION}>
            {mainComponent}
          </MediaQuery>
          <GridItem key="left" lg={3} md={12} sm={12}>
            <Grid>
              <GridItem lg={12} md={6} sm={12}>
                <Details {...props.detailsData} />
              </GridItem>
              <GridItem lg={12} md={6} sm={12}>
                <Inventory {...props.inventoryData} />
              </GridItem>
            </Grid>
          </GridItem>
          <MediaQuery key="main-large" minWidth={MEDIA_QUERY_LG}>
            {mainComponent}
          </MediaQuery>
          <GridItem key="right" lg={3} md={12} sm={12}>
            <Grid>
              <GridItem lg={12} md={6} sm={12}>
                <Events {...props.eventsData} />
              </GridItem>
              <GridItem lg={12} md={6} sm={12}>
                <TopConsumers {...props.consumersData} />
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </DashboardBody>
    </Dashboard>
  );
};

ClusterOverview.propTypes = {
  detailsData: PropTypes.object.isRequired,
  inventoryData: PropTypes.object.isRequired,
  healthData: PropTypes.object.isRequired,
  complianceData: PropTypes.object.isRequired,
  capacityStats: PropTypes.object.isRequired,
  utilizationStats: PropTypes.object.isRequired,
  eventsData: PropTypes.object.isRequired,
  consumersData: PropTypes.object.isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleSeeAll,
} from '../../Dashboard/DashboardCard';
import HealthBody from './HealthBody';
import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { SubsystemHealth } from '../../SubsystemHealth';

export const Health = ({ data, loaded }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster Health</DashboardCardTitle>
      <DashboardCardTitleSeeAll>
        <SubsystemHealth data={data} loaded={loaded} />
      </DashboardCardTitleSeeAll>
    </DashboardCardHeader>
    <DashboardCardBody className="kubevirt-health__body" isLoading={!loaded} LoadingComponent={InlineLoading}>
      <HealthBody data={data} />
    </DashboardCardBody>
  </DashboardCard>
);

Health.defaultProps = {
  loaded: false,
};

Health.propTypes = {
  data: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

const HealthConnected = () => <ClusterOverviewContextGenericConsumer Component={Health} dataPath="healthData" />;

export default HealthConnected;

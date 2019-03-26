import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import HealthBody from '../Health/HealthBody';
import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';

export const Compliance = ({ data, loaded }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster Compliance</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody className="kubevirt-compliance__body" isLoading={!loaded} LoadingComponent={InlineLoading}>
      <HealthBody data={data} />
    </DashboardCardBody>
  </DashboardCard>
);

Compliance.defaultProps = {
  loaded: false,
};

Compliance.propTypes = {
  data: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

const ComplianceConnected = () => (
  <ClusterOverviewContextGenericConsumer Component={Compliance} dataPath="complianceData" />
);

export default ComplianceConnected;

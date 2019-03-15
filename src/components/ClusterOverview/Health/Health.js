import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import HealthBody from './HealthBody';

const Health = ({ data, loaded }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster Health</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody className="kubevirt-health__body" isLoading={!loaded}>
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

export default Health;

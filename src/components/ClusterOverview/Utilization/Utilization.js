import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { UtilizationBody } from '../../Dashboard/Utilization/UtilizationBody';
import { UtilizationItem } from '../../Dashboard/Utilization/UtilizationItem';
import { getUtilizationCpuStats } from '../../../selectors';

export const Utilization = ({ cpuUtilization, LoadingComponent }) => {
  const cpuStats = getUtilizationCpuStats(cpuUtilization);
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Utilization</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <UtilizationBody>
          <UtilizationItem
            unit="%"
            id="cpu"
            title="CPU"
            data={cpuStats}
            maxY={100}
            LoadingComponent={LoadingComponent}
            isLoading={!cpuUtilization}
          />
        </UtilizationBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

Utilization.defaultProps = {
  cpuUtilization: null,
  LoadingComponent: InlineLoading,
};

Utilization.propTypes = {
  cpuUtilization: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const UtilizationConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <Utilization {...props} />}</ClusterOverviewContext.Consumer>
);

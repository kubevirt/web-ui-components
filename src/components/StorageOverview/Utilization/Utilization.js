import React from 'react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext';
import { InlineLoading } from '../../Loading';
import { UtilizationBody } from '../../Dashboard/Utilization/UtilizationBody';
import { UtilizationItem } from '../../Dashboard/Utilization/UtilizationItem';
import { getUtilizationVectorStats } from '../../../selectors';
import { formatBytes } from '../../../utils';

export const Utilization = ({ iopsUtilization, latencyUtilization, throughputUtilization, LoadingComponent }) => {
  const iopsStats = getUtilizationVectorStats(iopsUtilization);
  const latencyStats = getUtilizationVectorStats(latencyUtilization);

  const throughputStatsRaw = getUtilizationVectorStats(throughputUtilization);
  let throughputStats = null;
  let throughputMax = 0;
  let throughputMaxConverted;
  if (throughputStatsRaw) {
    throughputMax = Math.max(0, ...throughputStatsRaw);
    throughputMaxConverted = formatBytes(throughputMax);
    throughputStats = throughputStatsRaw.map(bytes => formatBytes(bytes, throughputMaxConverted.unit, 1).value);
  } else {
    throughputMaxConverted = formatBytes(throughputMax); // B
  }
  const throughputUnit = `${throughputMaxConverted.unit}/s`;

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Perfrormance</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <UtilizationBody>
          <UtilizationItem
            unit="IOPS"
            id="iops"
            title="IOPS"
            data={iopsStats}
            LoadingComponent={LoadingComponent}
            isLoading={!iopsUtilization}
          />
          <UtilizationItem
            unit="ms"
            id="latency"
            title="Latency"
            data={latencyStats}
            LoadingComponent={LoadingComponent}
            isLoading={!latencyUtilization}
          />
          <UtilizationItem
            unit={throughputUnit}
            id="throughput"
            title="Throughput"
            data={throughputStats}
            LoadingComponent={LoadingComponent}
            isLoading={!throughputUtilization}
          />
        </UtilizationBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

Utilization.defaultProps = {
  iopsUtilization: null,
  latencyUtilization: null,
  throughputUtilization: null,
  LoadingComponent: InlineLoading,
};

Utilization.propTypes = {
  iopsUtilization: PropTypes.object,
  latencyUtilization: PropTypes.object,
  throughputUtilization: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const UtilizationConnected = () => (
  <StorageOverviewContext.Consumer>{props => <Utilization {...props} />}</StorageOverviewContext.Consumer>
);

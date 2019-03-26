import React from 'react';
import { DonutChart } from 'patternfly-react';
import PropTypes from 'prop-types';

import { InlineLoading } from '../../Loading';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';

const pfGetUtilizationDonutTooltipContents = d =>
  `<span class="donut-tooltip-pf" style="white-space: nowrap;">${Math.round(d[0].ratio * 1000) / 10} ${
    d[0].name
  }</span>`;

const CapacityItem = ({ idSuffix, title, used, total, unit, formatValue }) => {
  const totalFormatted = formatValue(total, unit);
  const usedFormatted = formatValue(used, totalFormatted.unit);

  unit = totalFormatted.unit; // eslint-disable-line prefer-destructuring
  total = totalFormatted.value;
  used = usedFormatted.value;

  const available = total - used;
  const columns = [['Used', used], ['Available', available]];

  const percentageUsed = total > 0 ? Math.round((100 * used) / total) : 0;
  const availableNice = Number.isInteger(available) ? available : available.toFixed(1);
  const totalNice = Number.isInteger(total) ? total : total.toFixed(1);

  return (
    <div className="kubevirt-capacity__item">
      <h2 className="kubevirt-capacity__item-title">{title}</h2>
      <h6>{`${availableNice} ${unit} available out of ${totalNice} ${unit}`}</h6>
      <div>
        <DonutChart
          id={`donut-chart-${idSuffix}`}
          size={{ width: 150, height: 150 }}
          data={{
            unload: true,
            columns,
            order: null,
          }}
          unloadBeforeLoad
          tooltip={{ contents: pfGetUtilizationDonutTooltipContents }}
          title={{
            primary: `${percentageUsed.toString()}%`,
            secondary: columns[0][0],
          }}
        />
      </div>
    </div>
  );
};
CapacityItem.defaultProps = {
  formatValue: (value, unit) => ({ value, unit }),
  unit: undefined,
};
CapacityItem.propTypes = {
  idSuffix: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  used: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  unit: PropTypes.string,
  formatValue: PropTypes.func,
};

const CapacityItemLoading = ({ title, LoadingComponent }) => (
  <div className="kubevirt-capacity__item">
    <h2 className="kubevirt-capacity__item-title">{title}</h2>
    <LoadingComponent />
  </div>
);
CapacityItemLoading.propTypes = {
  title: PropTypes.string.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

const isLoaded = data =>
  data && 'used' in data && 'total' in data && !Number.isNaN(data.used) && !Number.isNaN(data.total);

const CapacityBody = ({ stats, LoadingComponent }) => (
  <div className="kubevirt-capacity__items">
    {Object.keys(stats).map(key =>
      isLoaded(stats[key].data) ? (
        <CapacityItem
          key={key}
          idSuffix={key}
          title={stats[key].title}
          unit={stats[key].unit}
          total={stats[key].data.total}
          used={stats[key].data.used}
          formatValue={stats[key].formatValue}
        />
      ) : (
        <CapacityItemLoading key={key} title={stats[key].title} LoadingComponent={LoadingComponent} />
      )
    )}
  </div>
);
CapacityBody.propTypes = {
  stats: PropTypes.object.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const Capacity = ({ capacityStats, LoadingComponent }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster Capacity</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody isLoading={false}>
      <CapacityBody stats={capacityStats} LoadingComponent={LoadingComponent} />
    </DashboardCardBody>
  </DashboardCard>
);

Capacity.defaultProps = {
  LoadingComponent: InlineLoading,
};

Capacity.propTypes = {
  capacityStats: PropTypes.object.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const CapacityConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <Capacity {...props} />}</ClusterOverviewContext.Consumer>
);

export default CapacityConnected;

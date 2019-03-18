import React from 'react';
import { DonutChart } from 'patternfly-react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContextGenericConsumer } from '../ClusterOverviewContext';

const pfGetUtilizationDonutTooltipContents = d =>
  `<span class="donut-tooltip-pf" style="white-space: nowrap;">${Math.round(d[0].ratio * 1000) / 10} ${
    d[0].name
  }</span>`;

class CapacityBody extends React.PureComponent {
  render() {
    const { stats } = this.props;
    return (
      <div className="kubevirt-capacity__items">
        {Object.keys(stats).map(key => {
          const available = stats[key].data.total - stats[key].data.used;
          const columns = [['Used', stats[key].data.used], ['Available', available]];
          const sum = columns.reduce((acc, x) => acc + x[1], 0);
          return (
            <div key={key} className="kubevirt-capacity__item">
              <h2 className="kubevirt-capacity__item-title">{stats[key].title}</h2>
              <h6>
                {`${Number.isInteger(available) ? available : available.toFixed(1)}${
                  stats[key].unit
                } available out of ${stats[key].data.total}${stats[key].unit}`}
              </h6>
              <div>
                <DonutChart
                  id={`donut-chart-${key}`}
                  size={{ width: 150, height: 150 }}
                  data={{
                    unload: true,
                    columns,
                    order: null,
                  }}
                  unloadBeforeLoad
                  tooltip={{ contents: pfGetUtilizationDonutTooltipContents }}
                  title={{
                    primary: `${Math.round((100 * columns[0][1]) / sum).toString()}%`,
                    secondary: columns[0][0],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

CapacityBody.propTypes = {
  stats: PropTypes.object.isRequired,
};

export const Capacity = ({ stats, loaded }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Cluster capacity</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody isLoading={!loaded}>
      <CapacityBody stats={stats} />
    </DashboardCardBody>
  </DashboardCard>
);

Capacity.defaultProps = {
  loaded: false,
};

Capacity.propTypes = {
  stats: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

const CapacityConnected = () => <ClusterOverviewContextGenericConsumer Component={Capacity} dataPath="capacityStats" />;

export default CapacityConnected;

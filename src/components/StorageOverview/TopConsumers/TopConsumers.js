import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Row, Col } from 'patternfly-react';
import {
  ChartGroup,
  ChartLine,
  ChartTheme,
  ChartTooltip,
  Chart,
  ChartAxis,
  ChartLegend,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';

import { InlineLoading } from '../../Loading';
import { formatToShortTime } from '../../../utils';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext/StorageOverviewContext';
import { getTopConsumerVectorStats } from '../../../selectors/prometheus/storage';

const TopConsumersBody = ({ topConsumers }) => {
  let results = 'No data available';
  const topConsumerStats = get(topConsumers, 'data.result', []);

  if (topConsumerStats.length) {
    const stats = getTopConsumerVectorStats(topConsumerStats);
    const { chartData, legends, maxCapacity, unit } = stats;
    const yTickValues = [
      0,
      Number((maxCapacity / 4).toFixed(1)),
      Number((maxCapacity / 2).toFixed(1)),
      Number(((3 * maxCapacity) / 4).toFixed(1)),
      maxCapacity,
      Number(((5 * maxCapacity) / 4).toFixed(1)),
      Number(((6 * maxCapacity) / 4).toFixed(1)),
    ];

    const chartLineList = chartData.map((data, i) => <ChartLine key={i} data={data} x={0} y={1} />);
    results = (
      <React.Fragment>
        <Row>
          <Col className="kubevirt-top-consumer__time-duration">Last 10 minutes</Col>
        </Row>
        <Row>
          <div>
            <Chart
              domain={{ y: [0, 1.5 * maxCapacity] }}
              theme={ChartTheme.light.multi}
              height={175}
              padding={{ top: 20, bottom: 20, left: 40, right: 17 }}
              containerComponent={
                <ChartVoronoiContainer
                  labels={datum => `${datum[1]} ${unit}`}
                  labelComponent={<ChartTooltip style={{ fontSize: 8, padding: 5 }} />}
                />
              }
              scale={{ x: 'time' }}
            >
              <ChartGroup>{chartLineList}</ChartGroup>
              <ChartAxis tickFormat={x => formatToShortTime(x)} style={{ tickLabels: { fontSize: 8, padding: 5 } }} />
              <ChartAxis
                label={`Requested capacity(${unit})`}
                dependentAxis
                tickValues={yTickValues}
                style={{ tickLabels: { fontSize: 8, padding: 5 }, axisLabel: { fontSize: 8, padding: 25 } }}
              />
            </Chart>
          </div>
          <ChartLegend
            data={legends}
            orientation="horizontal"
            gutter={10}
            height={30}
            padding={{ top: 5, bottom: 5, left: 20 }}
            theme={ChartTheme.light.multi}
            x={50}
            y={8}
          />
        </Row>
      </React.Fragment>
    );
  }

  return <div>{results}</div>;
};

export const TopConsumers = ({ topConsumers, LoadingComponent }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Top Projects by Requested Capacity</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody isLoading={!topConsumers} LoadingComponent={LoadingComponent}>
      <TopConsumersBody topConsumers={topConsumers} />
    </DashboardCardBody>
  </DashboardCard>
);

TopConsumersBody.defaultProps = {
  topConsumers: null,
};

TopConsumersBody.propTypes = {
  topConsumers: PropTypes.object,
};

TopConsumers.defaultProps = {
  topConsumers: null,
  LoadingComponent: InlineLoading,
};

TopConsumers.propTypes = {
  topConsumers: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const TopConsumersConnected = () => (
  <StorageOverviewContext.Consumer>{props => <TopConsumers {...props} />}</StorageOverviewContext.Consumer>
);

export default TopConsumersConnected;

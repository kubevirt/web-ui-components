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
import { Dropdown } from '../../Form/Dropdown';
import { DashboardCardActionsBody } from '../../Dashboard/DashboardCard/DashboardCardActionsBody';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';

import { PROJECTS, STORAGE_CLASSES, PODS, BY_USED_CAPACITY, BY_REQUESTED_CAPACITY } from './strings';
import { StorageOverviewContext } from '../StorageOverviewContext/StorageOverviewContext';
import { getTopConsumerVectorStats } from '../../../selectors/prometheus/storage';

const metricTypes = [PROJECTS, STORAGE_CLASSES, PODS];
const sortBy = [
  { name: BY_USED_CAPACITY, refObj: 'byUsedCapacity' },
  { name: BY_REQUESTED_CAPACITY, refObj: 'byRequestedCapacity' },
];

export const TopConsumersBody = ({ topConsumerStats, metricType, sortByOption }) => {
  let results = 'No data available';

  if (topConsumerStats.length) {
    const stats = getTopConsumerVectorStats(topConsumerStats, metricType);
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
                label={`${sortByOption.name}(${unit})`}
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

export class TopConsumers extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: metricTypes[0],
      sortBy: sortBy[0],
    };
  }

  changeMetricType = newVal => {
    this.setState({ type: newVal }, this.getCurrentMetric);
  };

  changeSortBy = newVal => {
    this.setState({ sortBy: newVal }, this.getCurrentMetric);
  };

  getCapacity = data => get(data, 'data.result', []);

  metrics = {
    projects: {
      byUsedCapacity: () => this.getCapacity(this.props.projectsUsedCapacity),
      byRequestedCapacity: () => this.getCapacity(this.props.projectsRequestedCapacity),
    },
    storageClasses: {
      byUsedCapacity: () => this.getCapacity(this.props.slClassesUsedCapacity),
      byRequestedCapacity: () => this.getCapacity(this.props.slClassesRequestedCapacity),
    },
    pods: {
      byUsedCapacity: () => this.getCapacity(this.props.podsUsedCapacity),
      byRequestedCapacity: () => this.getCapacity(this.props.podsRequestedCapacity),
    },
  };

  getCurrentMetric = () => {
    switch (this.state.type) {
      case PROJECTS:
        return this.metrics.projects[this.state.sortBy.refObj]();

      case STORAGE_CLASSES:
        return this.metrics.storageClasses[this.state.sortBy.refObj]();

      case PODS:
        return this.metrics.pods[this.state.sortBy.refObj]();

      default:
        return [];
    }
  };

  render() {
    const {
      LoadingComponent,
      projectsUsedCapacity,
      projectsRequestedCapacity,
      slClassesUsedCapacity,
      slClassesRequestedCapacity,
      podsUsedCapacity,
      podsRequestedCapacity,
    } = this.props;
    const metric = this.getCurrentMetric();
    const isLoading =
      !projectsUsedCapacity &&
      !projectsRequestedCapacity &&
      !slClassesRequestedCapacity &&
      !slClassesUsedCapacity &&
      !podsUsedCapacity &&
      !podsRequestedCapacity;

    return (
      <DashboardCard>
        <DashboardCardHeader>
          <Row>
            <Col lg={6} md={6} sm={6} xs={6}>
              <DashboardCardTitle>Top Consumers</DashboardCardTitle>
            </Col>
            <Col lg={6} md={6} sm={6} xs={6}>
              <DashboardCardActionsBody>
                <Dropdown
                  id="metric-type"
                  value={this.state.type}
                  onChange={this.changeMetricType}
                  choices={metricTypes}
                  disabled={isLoading}
                  groupClassName="kubevirt-dropdown__group"
                />
                <Dropdown
                  id="sort-by"
                  value={this.state.sortBy.name}
                  onChange={this.changeSortBy}
                  choices={sortBy}
                  disabled={isLoading}
                  groupClassName="kubevirt-dropdown__group"
                />
              </DashboardCardActionsBody>
            </Col>
          </Row>
        </DashboardCardHeader>
        <DashboardCardBody isLoading={isLoading} LoadingComponent={LoadingComponent}>
          <TopConsumersBody topConsumerStats={metric} metricType={this.state.type} sortByOption={this.state.sortBy} />
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}

TopConsumersBody.propTypes = {
  topConsumerStats: PropTypes.array.isRequired,
  metricType: PropTypes.string.isRequired,
  sortByOption: PropTypes.object.isRequired,
};

TopConsumers.defaultProps = {
  projectsRequestedCapacity: null,
  projectsUsedCapacity: null,
  slClassesRequestedCapacity: null,
  slClassesUsedCapacity: null,
  podsRequestedCapacity: null,
  podsUsedCapacity: null,
  LoadingComponent: InlineLoading,
};

TopConsumers.propTypes = {
  projectsRequestedCapacity: PropTypes.object,
  projectsUsedCapacity: PropTypes.object,
  slClassesRequestedCapacity: PropTypes.object,
  slClassesUsedCapacity: PropTypes.object,
  podsUsedCapacity: PropTypes.object,
  podsRequestedCapacity: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const TopConsumersConnected = () => (
  <StorageOverviewContext.Consumer>
    {props => (
      <TopConsumers
        LoadingComponent={props.LoadingComponent}
        projectsUsedCapacity={props.projectsUsedCapacity}
        projectsRequestedCapacity={props.projectsRequestedCapacity}
        slClassesUsedCapacity={props.slClassesUsedCapacity}
        slClassesRequestedCapacity={props.slClassesRequestedCapacity}
        podsUsedCapacity={props.podsUsedCapacity}
        podsRequestedCapacity={props.podsRequestedCapacity}
      />
    )}
  </StorageOverviewContext.Consumer>
);

TopConsumersConnected.propTypes = {
  ...TopConsumers.propTypes,
};

TopConsumersConnected.defaultProps = {
  ...TopConsumers.defaultProps,
};

export default TopConsumersConnected;

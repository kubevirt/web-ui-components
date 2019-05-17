import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'patternfly-react';
import { ChartAxis } from '@patternfly/react-charts';

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
import { getUtilizationVectorStats, getUtilizationVectorTime } from '../../../selectors';
import { formatBytes, formatToShortTime } from '../../../utils';
import { ONE_HR, SIX_HR, TWENTY_FOUR_HR } from './strings';
import { DashboardCardActionsBody } from '../../Dashboard/DashboardCard/DashboardCardActionsBody';
import { Dropdown } from '../../Form/Dropdown';

const metricDurations = [ONE_HR, SIX_HR, TWENTY_FOUR_HR];

const getUtilizationData = data => {
  let stats = null;
  let maxValueConverted;

  const statsRaw = getUtilizationVectorStats(data);
  if (statsRaw) {
    const maxValue = Math.max(0, ...statsRaw);
    maxValueConverted = formatBytes(maxValue);
    stats = statsRaw.map(bytes => formatBytes(bytes, maxValueConverted.unit, 1).value);
  } else {
    maxValueConverted = formatBytes(0);
    stats = null;
  }

  const timeRaw = getUtilizationVectorTime(data);

  return {
    unit: `${maxValueConverted.unit}/s`,
    values: stats,
    timestamps: timeRaw,
    maxValue: Number(maxValueConverted.value.toFixed(1)),
  };
};

export class Utilization extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      duration: metricDurations[1],
    };
  }

  changeMetricDuration = newVal => {
    this.setState({ duration: newVal }, this.getUtilizationCallback);
  };

  getUtilizationCallback = () => this.props.utilizationCallback(this.state.duration);

  calculateMetricDetails = (throughputUtilization, recoveryRateUtilization, iopsUtilization, latencyUtilization) => {
    const throughputData = getUtilizationData(throughputUtilization);
    const recoveryRateData = getUtilizationData(recoveryRateUtilization);

    const iopsStats = getUtilizationVectorStats(iopsUtilization);
    let iopsStatsMax = 0;
    if (iopsStats) {
      iopsStatsMax = Math.ceil(Math.max(0, ...iopsStats));
    }
    const latencyStats = getUtilizationVectorStats(latencyUtilization);
    let latencyStatsMax = 0;
    if (latencyStats) {
      latencyStatsMax = Math.max(0, ...latencyStats);
    }
    const { timestamps } = throughputData;

    throughputData.isLoading = !throughputUtilization;
    recoveryRateData.isLoading = !recoveryRateUtilization;

    const iopsData = {
      iopsStats,
      iopsStatsMax,
      isLoading: !iopsUtilization,
    };

    const latencyData = {
      latencyStats,
      latencyStatsMax,
      isLoading: !latencyUtilization,
    };

    return {
      throughputData,
      recoveryRateData,
      iopsData,
      latencyData,
      timestamps,
    };
  };

  render() {
    const {
      iopsUtilization,
      latencyUtilization,
      throughputUtilization,
      recoveryRateUtilization,
      LoadingComponent,
    } = this.props;

    const metric = this.calculateMetricDetails(
      this.props.throughputUtilization,
      this.props.recoveryRateUtilization,
      this.props.iopsUtilization,
      this.props.latencyUtilization
    );

    const isLoading = !iopsUtilization && !latencyUtilization && !throughputUtilization && !recoveryRateUtilization;

    return (
      <DashboardCard>
        <DashboardCardHeader>
          <Row>
            <Col lg={6} md={6} sm={6} xs={6}>
              <DashboardCardTitle>Utilization</DashboardCardTitle>
            </Col>
            <Col lg={6} md={6} sm={6} xs={6}>
              <DashboardCardActionsBody>
                <Dropdown
                  id="metric-duration"
                  value={this.state.duration}
                  onChange={this.changeMetricDuration}
                  choices={metricDurations}
                  disabled={isLoading}
                  groupClassName="kubevirt-dropdown__group"
                />
              </DashboardCardActionsBody>
            </Col>
          </Row>
        </DashboardCardHeader>
        <DashboardCardBody>
          <Row>
            <Col className="kubevirt-utilization__time-duration kubevirt-utilization__time-duration--left">Time </Col>
            <Col className="kubevirt-utilization__time-duration kubevirt-utilization__time-duration--right">
              {this.state.duration} average
            </Col>
          </Row>
          <ChartAxis
            scale={{ x: 'time' }}
            tickValues={metric.timestamps}
            tickFormat={x => formatToShortTime(x)}
            orientation="top"
            height={30}
            padding={{ top: 25, bottom: 0, left: 43, right: 20 }}
          />
          <UtilizationBody>
            <UtilizationItem
              unit={metric.throughputData.unit}
              id="throughput"
              title="Throughput"
              data={metric.throughputData.values}
              maxY={metric.throughputData.maxValue}
              decimalPoints={1}
              LoadingComponent={LoadingComponent}
              isLoading={metric.throughputData.isLoading}
            />
            <UtilizationItem
              unit="IOPS"
              id="iops"
              title="IOPS"
              data={metric.iopsData.iopsStats}
              maxY={metric.iopsData.iopsStatsMax}
              decimalPoints={0}
              LoadingComponent={LoadingComponent}
              isLoading={metric.iopsData.isLoading}
            />
            <UtilizationItem
              unit="ms"
              id="latency"
              title="Latency"
              data={metric.latencyData.latencyStats}
              maxY={metric.latencyData.latencyStatsMax}
              decimalPoints={1}
              LoadingComponent={LoadingComponent}
              isLoading={metric.latencyData.isLoading}
            />
            <UtilizationItem
              unit={metric.recoveryRateData.unit}
              id="recoveryRate"
              title="Recovery rate"
              data={metric.recoveryRateData.values}
              maxY={metric.recoveryRateData.maxValue}
              decimalPoints={1}
              LoadingComponent={LoadingComponent}
              isLoading={metric.recoveryRateData.isLoading}
            />
          </UtilizationBody>
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}

Utilization.defaultProps = {
  iopsUtilization: null,
  latencyUtilization: null,
  throughputUtilization: null,
  recoveryRateUtilization: null,
  LoadingComponent: InlineLoading,
};

Utilization.propTypes = {
  iopsUtilization: PropTypes.object,
  latencyUtilization: PropTypes.object,
  throughputUtilization: PropTypes.object,
  recoveryRateUtilization: PropTypes.object,
  utilizationCallback: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const UtilizationConnected = () => (
  <StorageOverviewContext.Consumer>
    {props => (
      <Utilization
        iopsUtilization={props.iopsUtilization}
        latencyUtilization={props.latencyUtilization}
        throughputUtilization={props.throughputUtilization}
        recoveryRateUtilization={props.recoveryRateUtilization}
        LoadingComponent={props.LoadingComponent}
      />
    )}
  </StorageOverviewContext.Consumer>
);

UtilizationConnected.defaultProps = {
  ...Utilization.defaultProps,
};

UtilizationConnected.propTypes = {
  ...Utilization.propTypes,
};

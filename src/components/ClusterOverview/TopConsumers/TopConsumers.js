import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Col } from 'patternfly-react';

import { getFormElement } from '../../Form';
import { DROPDOWN } from '../../Form/constants';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleHelp,
} from '../../Dashboard/DashboardCard';
import { ClusterOverviewContext } from '../ClusterOverviewContext';
import { InlineLoading } from '../../Loading';
import { ConsumerItem } from '../../Dashboard/TopConsumers/ConsumerItem';
import { ConsumersResults } from '../../Dashboard/TopConsumers/ConsumersResults';
import {
  BY_CPU,
  BY_NETWORK,
  BY_STORAGE,
  BY_MEMORY,
  PODS_AND_VMS,
  INFRASTRUCTURE,
  NODES,
  WORKLOADS,
  CPU_DESC,
  MEMORY_DESC,
  STORAGE_DESC,
  NETWORK_DESC,
} from './strings';
import { ConsumersFilter } from '../../Dashboard/TopConsumers/ConsumersFilter';
import { formatCpu, getMetric, formatBytesWithUnits } from './utils';
import { getMetricConsumers } from '../../Dashboard/TopConsumers/utils';

const metricTypes = [{ name: PODS_AND_VMS, description: WORKLOADS }, { name: NODES, description: INFRASTRUCTURE }];

const sortBy = [
  { name: BY_CPU, description: CPU_DESC },
  { name: BY_MEMORY, description: MEMORY_DESC },
  { name: BY_STORAGE, description: STORAGE_DESC },
  { name: BY_NETWORK, description: NETWORK_DESC },
];

export class TopConsumers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: metricTypes[0],
      sortBy: sortBy[0],
    };
  }

  getCurrentMetric = () => {
    switch (this.state.type.name) {
      case PODS_AND_VMS:
        switch (this.state.sortBy.name) {
          case BY_CPU:
            return getMetric(this.props.workloadCpuResults, 'pod_name', formatCpu);
          case BY_MEMORY:
            return getMetric(this.props.workloadMemoryResults, 'pod_name', formatBytesWithUnits);
          case BY_STORAGE:
            return getMetric(this.props.workloadStorageResults, 'pod_name', formatBytesWithUnits);
          case BY_NETWORK:
            return getMetric(this.props.workloadNetworkResults, 'pod_name');
          default:
            // eslint-disable-next-line no-console
            console.log(`Unknown metric ${this.state.sortBy.name}`);
            return null;
        }
      case NODES:
        switch (this.state.sortBy.name) {
          case BY_CPU:
            return getMetric(this.props.infraCpuResults, 'node', cpu => formatCpu(cpu, 1));
          case BY_MEMORY:
            return getMetric(this.props.infraMemoryResults, 'node', formatBytesWithUnits);
          case BY_STORAGE:
            return getMetric(this.props.infraStorageResults, 'node', formatBytesWithUnits);
          case BY_NETWORK:
            return getMetric(this.props.infraNetworkResults, 'node');
          default:
            // eslint-disable-next-line no-console
            console.log(`Unknown metric ${this.state.sortBy.name}`);
            return null;
        }
      default:
        // eslint-disable-next-line no-console
        console.log(`Unknown metric type ${this.state.type.name}`);
        return null;
    }
  };

  render() {
    const typeDropdown = {
      id: 'type-dropdown',
      type: DROPDOWN,
      choices: metricTypes,
      onChange: newValue => this.setState({ type: newValue }),
      value: this.state.type,
    };
    const sortByDropdown = {
      id: 'sort-by-dropdown',
      type: DROPDOWN,
      choices: sortBy,
      onChange: newValue => this.setState({ sortBy: newValue }),
      value: this.state.sortBy,
    };

    const metric = this.getCurrentMetric();

    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>Top Consumers</DashboardCardTitle>
          <DashboardCardTitleHelp>
            Consumption bar is relative to biggest consumer which is always 100%
          </DashboardCardTitleHelp>
        </DashboardCardHeader>
        <DashboardCardBody>
          <ConsumersFilter>
            <Col lg={6} md={6} sm={6} xs={6} className="kubevirt-consumers__dropdown-type-filter">
              {getFormElement(typeDropdown)}
            </Col>
            <Col lg={6} md={6} sm={6} xs={6} className="kubevirt-consumers__dropdown-sort-filter">
              {getFormElement(sortByDropdown)}
            </Col>
          </ConsumersFilter>
          <ConsumersResults
            isLoading={get(metric, 'isLoading')}
            LoadingComponent={this.props.LoadingComponent}
            type={this.state.type.description}
            description={this.state.sortBy.description}
          >
            {get(metric, 'consumers') &&
              getMetricConsumers(metric).map((c, index) => <ConsumerItem key={index} {...c} />)}
          </ConsumersResults>
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}

TopConsumers.defaultProps = {
  workloadCpuResults: null,
  workloadMemoryResults: null,
  workloadStorageResults: null,
  workloadNetworkResults: null,
  infraCpuResults: null,
  infraMemoryResults: null,
  infraStorageResults: null,
  infraNetworkResults: null,
  LoadingComponent: InlineLoading,
};

TopConsumers.propTypes = {
  infraCpuResults: PropTypes.object,
  infraMemoryResults: PropTypes.object,
  infraStorageResults: PropTypes.object,
  infraNetworkResults: PropTypes.object,
  workloadCpuResults: PropTypes.object,
  workloadMemoryResults: PropTypes.object,
  workloadStorageResults: PropTypes.object,
  workloadNetworkResults: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const TopConsumersConnected = () => (
  <ClusterOverviewContext.Consumer>{props => <TopConsumers {...props} />}</ClusterOverviewContext.Consumer>
);

import React from 'react';
import { UtilizationBar } from 'patternfly-react';

import PropTypes from 'prop-types';

import { getFormElement } from '../../Form';
import { DROPDOWN } from '../../Form/constants';
import { PodModel, VirtualMachineModel } from '../../../models';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardTitleHelp,
} from '../../Dashboard/DashboardCard';

const sortConsumers = (metrics, filter, sortBy) => {
  const metricKey = Object.keys(metrics).find(key => metrics[key].title === sortBy);
  const filteredConsumers =
    filter !== 'All' ? metrics[metricKey].consumers.filter(c => c.kind === filter) : metrics[metricKey].consumers;
  const max = Math.max(...filteredConsumers.map(c => c.usage));
  return filteredConsumers
    .map(c => ({
      now: Math.round((100 * c.usage) / max),
      description: c.name,
    }))
    .sort((a, b) => b.now - a.now);
};

class TopConsumersBody extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filter: 'All',
      sortBy: 'CPU',
    };
  }

  onDropdownChange = (key, newValue) => this.setState({ [key]: newValue });

  render() {
    const sortByDropdown = {
      id: 'sort-by-dropdown',
      type: DROPDOWN,
      choices: ['CPU', 'Memory', 'Network', 'Storage'],
      onChange: newValue => this.onDropdownChange('sortBy', newValue),
      value: this.state.sortBy,
    };
    const filterDropdown = {
      id: 'filter-dropdown',
      type: DROPDOWN,
      choices: ['All', PodModel.kind, VirtualMachineModel.kind],
      onChange: newValue => this.onDropdownChange('filter', newValue),
      value: this.state.filter,
    };
    return (
      <div>
        <div className="kubevirt-consumers__filters">
          {getFormElement(filterDropdown)}
          {getFormElement(sortByDropdown)}
        </div>
        {sortConsumers(this.props.metrics, this.state.filter, this.state.sortBy).map((c, index) => (
          <UtilizationBar key={index} {...c} className="kubevirt-consumers__bar" />
        ))}
      </div>
    );
  }
}

TopConsumersBody.propTypes = {
  metrics: PropTypes.object.isRequired,
};

const TopConsumers = ({ metrics, loaded }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Top Consumers</DashboardCardTitle>
      <DashboardCardTitleHelp>help for top consumers</DashboardCardTitleHelp>
    </DashboardCardHeader>
    <DashboardCardBody isLoading={!loaded}>
      <TopConsumersBody metrics={metrics} />
    </DashboardCardBody>
  </DashboardCard>
);

TopConsumers.defaultProps = {
  loaded: false,
};

TopConsumers.propTypes = {
  metrics: PropTypes.object.isRequired,
  loaded: PropTypes.bool,
};

export default TopConsumers;

import React from 'react';
import { UtilizationBar } from 'patternfly-react';

import { getFormElement } from '../../Form';
import { DROPDOWN } from '../../Form/constants';
import { PodModel, VirtualMachineModel } from '../../../models';

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

export class Consumers extends React.PureComponent {
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

Consumers.title = 'Top consumers';
Consumers.help = 'help for top consumers';

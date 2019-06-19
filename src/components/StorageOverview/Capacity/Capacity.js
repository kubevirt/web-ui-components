import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'patternfly-react';

import { InlineLoading } from '../../Loading';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { Dropdown } from '../../Form/Dropdown';
import { DashboardCardActionsBody } from '../../Dashboard/DashboardCard/DashboardCardActionsBody';

import { StorageOverviewContext } from '../StorageOverviewContext';
import { CapacityItem } from '../../Dashboard/Capacity/CapacityItem';
import { formatBytes } from '../../../utils';
import { getCapacityStats } from '../../../selectors';
import { CapacityBody } from '../../Dashboard/Capacity/CapacityBody';
import { TOTAL, CAPACITY, VMSVSPODS } from './strings';

const capacityTypes = [TOTAL, CAPACITY, VMSVSPODS];

export class Capacity extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      capacity: capacityTypes[0],
    };
  }

  convertMetrics = (total, used, title) => ({ total, used, title });

  changeCapacityMetric = newVal => {
    this.setState({ capacity: newVal }, this.getNewCapacityMetric);
  };

  getNewCapacityMetric = () => {
    switch (this.state.capacity) {
      case TOTAL:
        return this.convertMetrics(this.props.capacityTotal, this.props.capacityUsed, TOTAL);
      case CAPACITY:
        return this.convertMetrics(this.props.capacityRequested, this.props.capacityUsed, CAPACITY);
      case VMSVSPODS:
        return this.convertMetrics(this.props.podsCapacity, this.props.vmsCapacity, VMSVSPODS);
      default:
        return [];
    }
  };

  render() {
    const { capacityTotal, capacityRequested, capacityUsed, vmsCapacity, podsCapacity, LoadingComponent } = this.props;

    const capacitymetric = this.getNewCapacityMetric();
    const isLoading = !capacityTotal && !capacityRequested && !capacityUsed && !vmsCapacity && !podsCapacity;

    return (
      <DashboardCard className="kubevirt-capacity__card">
        <DashboardCardHeader>
          <Row>
            <Col lg={6} md={6} sm={6} xs={6}>
              <DashboardCardTitle>Capacity</DashboardCardTitle>
            </Col>
            <Col>
              <DashboardCardActionsBody>
                <Dropdown
                  id="capacity-type"
                  value={this.state.capacity}
                  onChange={this.changeCapacityMetric}
                  choices={capacityTypes}
                  disabled={isLoading}
                  groupClassName="kubevirt-dropdown__group"
                />
              </DashboardCardActionsBody>
            </Col>
          </Row>
        </DashboardCardHeader>
        <DashboardCardBody>
          <CapacityBody>
            <CapacityItem
              id="capacity"
              title={capacitymetric.title}
              used={getCapacityStats(capacitymetric.used)}
              total={getCapacityStats(capacitymetric.total)}
              formatValue={formatBytes}
              isLoading={!(capacitymetric.used && capacitymetric.total)}
              LoadingComponent={LoadingComponent}
            />
          </CapacityBody>
        </DashboardCardBody>
      </DashboardCard>
    );
  }
}

Capacity.defaultProps = {
  capacityTotal: null,
  capacityRequested: null,
  capacityUsed: null,
  vmsCapacity: null,
  podsCapacity: null,
  LoadingComponent: InlineLoading,
};

Capacity.propTypes = {
  capacityTotal: PropTypes.object,
  capacityRequested: PropTypes.object,
  capacityUsed: PropTypes.object,
  vmsCapacity: PropTypes.object,
  podsCapacity: PropTypes.object,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export const CapacityConnected = () => (
  <StorageOverviewContext.Consumer>
    {props => (
      <Capacity
        capacityTotal={props.capacityTotal}
        capacityUsed={props.capacityUsed}
        capacityRequested={props.capacityRequested}
        vmsCapacity={props.vmsCapacity}
        podsCapacity={props.podsCapacity}
        LoadingComponent={props.LoadingComponent}
      />
    )}
  </StorageOverviewContext.Consumer>
);

CapacityConnected.propTypes = {
  ...Capacity.propTypes,
};

CapacityConnected.defaultProps = {
  ...Capacity.defaultProps,
};

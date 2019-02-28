import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, CardTitle, CardBody, CardHeading, Popover, Button, Icon, OverlayTrigger, Col } from 'patternfly-react';

import { Details } from './Details/Details';
import { Health, Compliance } from './Health/Health';
import { Events } from './Events/Events';
import { Inventory } from './Inventory/Inventory';
import { Capacity } from './Capacity/Capacity';
import { Utilization } from './Utilization/Utilization';
import { Consumers } from './Consumers/Consumers';
import { Loading } from '../Loading';

const CardItemHelp = ({ content }) => {
  const overlay = <Popover id="popover">{content}</Popover>;
  return (
    <OverlayTrigger overlay={overlay} placement="top" trigger={['click']} rootClose>
      <Button bsStyle="link">
        <Icon type="fa" name="info-circle" size="2x" />
      </Button>
    </OverlayTrigger>
  );
};

CardItemHelp.propTypes = {
  content: PropTypes.object.isRequired,
};

export const overviewItem = (LoadingComponent, Component, name) => props => (
  <Card className={classNames('kubevirt-cluster-overview__item', `kubevirt-${name}`)}>
    <CardHeading className="kubevirt-cluster-overview__item-heading">
      <CardTitle>{Component.title}</CardTitle>
      {Component.help && <CardItemHelp content={Component.help} />}
    </CardHeading>
    <CardBody className={`kubevirt-${name}__body`}>
      {props.loaded ? <Component {...props} /> : <LoadingComponent />}
    </CardBody>
  </Card>
);

export class ClusterOverview extends React.Component {
  constructor(props) {
    super(props);
    this.DetailsItem = overviewItem(props.LoadingComponent, Details, 'details');
    this.InventoryItem = overviewItem(props.LoadingComponent, Inventory, 'inventory');
    this.HealthItem = overviewItem(props.LoadingComponent, Health, 'health');
    this.ComplianceItem = overviewItem(props.LoadingComponent, Compliance, 'health');
    this.CapacityItem = overviewItem(props.LoadingComponent, Capacity, 'capacity');
    this.UtilizationItem = overviewItem(props.LoadingComponent, Utilization, 'utilization');
    this.EventsItem = overviewItem(props.LoadingComponent, Events, 'events');
    this.ConsumersItem = overviewItem(props.LoadingComponent, Consumers, 'consumers');
  }

  render() {
    return (
      <div className="kubevirt-cluster-overview">
        <div className="co-m-nav-title">
          <h1 className="co-m-pane__heading">Cluster Dashboard</h1>
        </div>
        <div className="kubevirt-cluster-overview__body">
          <Col lg={3} md={3} sm={3} xs={3} className="kubevirt-cluster-overview__column-first">
            <this.DetailsItem {...this.props.detailsData} />
            <this.InventoryItem {...this.props.inventoryData} />
          </Col>
          <Col lg={6} md={6} sm={6} xs={6} className="kubevirt-cluster-overview__column-second">
            <div className="kubevirt-cluster-overview__column-second-row">
              <this.HealthItem {...this.props.healthData} />
              <this.ComplianceItem {...this.props.complianceData} />
            </div>
            <this.CapacityItem {...this.props.capacityStats} />
            <this.UtilizationItem {...this.props.utilizationStats} />
          </Col>
          <Col lg={3} md={3} sm={3} xs={3} className="kubevirt-cluster-overview__column-third">
            <this.EventsItem {...this.props.eventsData} />
            <this.ConsumersItem {...this.props.consumersData} />
          </Col>
        </div>
      </div>
    );
  }
}

ClusterOverview.defaultProps = {
  LoadingComponent: Loading,
};

ClusterOverview.propTypes = {
  detailsData: PropTypes.object.isRequired,
  inventoryData: PropTypes.object.isRequired,
  healthData: PropTypes.object.isRequired,
  complianceData: PropTypes.object.isRequired,
  capacityStats: PropTypes.object.isRequired,
  utilizationStats: PropTypes.object.isRequired,
  eventsData: PropTypes.object.isRequired,
  consumersData: PropTypes.object.isRequired,
};

import React from 'react';
import { LineChart, Row, Col } from 'patternfly-react';
import PropTypes from 'prop-types';

import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '../../Dashboard/DashboardCard';
import { StorageOverviewContext } from '../StorageOverviewContext/StorageOverviewContext';
import { getTopConsumerVectorStats } from '../../../selectors';

const TopConsumersBody = ({ columns }) => (
  <div>
    <Row>
      <Col lg={12} md={12} sm={12} xs={12}>
        <LineChart
          className="kubevirt-top-consumers__body"
          id="line-chart"
          data={{
            x: 'x',
            columns,
            type: 'line',
          }}
          axis={{
            y: {
              label: {
                text: 'Used Capacity',
                position: 'outer-top',
              },
            },
            x: {
              tick: {
                count: 6,
                format: v => `${Math.floor(v / 100)} : ${Math.floor(v % 100)}`,
              },
            },
          }}
        />
      </Col>
    </Row>
  </div>
);

export const TopConsumers = ({ stats, loaded }) => {
  const columns = getTopConsumerVectorStats(stats);

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Top Consumers</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody isLoading={!loaded}>
        <TopConsumersBody columns={columns} />
      </DashboardCardBody>
    </DashboardCard>
  );
};

TopConsumersBody.propTypes = {
  columns: PropTypes.array.isRequired,
};

TopConsumers.defaultProps = {
  stats: [],
  loaded: false,
};

TopConsumers.propTypes = {
  stats: PropTypes.array,
  loaded: PropTypes.bool,
};

const TopConsumersConnected = () => (
  <StorageOverviewContext.Consumer>{props => <TopConsumers {...props} />}</StorageOverviewContext.Consumer>
);

export default TopConsumersConnected;

import React from 'react';
import PropTypes from 'prop-types';

import { LineChart, Row, Col } from 'patternfly-react';

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

const TopConsumersBody = ({ topConsumerStats }) => {
  let results = 'No data available';

  if (topConsumerStats.length) {
    const columnsConf = getTopConsumerVectorStats(topConsumerStats);
    const { columns, unit } = columnsConf;
    const formatTime = x => formatToShortTime(x);

    results = (
      <React.Fragment>
        <Row>
          <Col className="kubevirt-top-consumer__time-duration">Last 6 hours</Col>
        </Row>
        <Row>
          <Col lg={12} md={12} sm={12} xs={12}>
            <LineChart
              className="kubevirt-top-consumer__line-chart"
              id="line-chart"
              data={{
                x: 'x',
                columns,
                type: 'line',
              }}
              axis={{
                y: {
                  label: {
                    text: `Used Capacity(${unit})`,
                    position: 'outer-top',
                  },
                  min: 0,
                  padding: {
                    bottom: 3,
                  },
                },
                x: {
                  tick: {
                    format: formatTime,
                    fit: true,
                    values: [...columns[0].slice(1)],
                  },
                },
              }}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  return <div>{results}</div>;
};

export const TopConsumers = ({ topConsumerStats, topConsumerLoaded, LoadingComponent }) => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Top Projects by Used Capacity</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody isLoading={!topConsumerLoaded} LoadingComponent={LoadingComponent}>
      <TopConsumersBody topConsumerStats={topConsumerStats} />
    </DashboardCardBody>
  </DashboardCard>
);

TopConsumersBody.propTypes = {
  topConsumerStats: PropTypes.array.isRequired,
};

TopConsumers.defaultProps = {
  topConsumerStats: [],
  topConsumerLoaded: false,
  LoadingComponent: InlineLoading,
};

TopConsumers.propTypes = {
  topConsumerStats: PropTypes.array,
  topConsumerLoaded: PropTypes.bool,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const TopConsumersConnected = () => (
  <StorageOverviewContext.Consumer>{props => <TopConsumers {...props} />}</StorageOverviewContext.Consumer>
);

export default TopConsumersConnected;

import React from 'react';
import PropTypes from 'prop-types';

import { Col, Row, SparklineChart } from 'patternfly-react';

import { InlineLoading } from '../../Loading';
import { NOT_AVAILABLE } from './strings';

export const UtilizationItem = ({ id, title, data, maxY, unit, isLoading, LoadingComponent }) => {
  const axis = {
    y: {
      show: true,
      padding: {
        top: 0,
        bottom: 0,
      },
      tick: {
        count: 3,
      },
    },
    x: {
      show: false,
    },
  };
  if (maxY) {
    axis.y.max = maxY;
  }

  let actual;
  let chartData;
  if (!isLoading && data) {
    actual = Math.round(data[data.length - 1]);
    chartData = {
      columns: [[unit, ...data.map(val => val.toFixed(1))]],
      unload: true,
      type: 'area',
    };
  }

  return (
    <div className="kubevirt-utilization__item">
      <Row>
        <Col lg={2} md={2} sm={2} xs={2}>
          {title}
        </Col>
        <Col className="kubevirt-utilization__item-actual" lg={3} md={3} sm={3} xs={3}>
          {isLoading || !data || `${actual} ${unit}`}
        </Col>
        <Col className="kubevirt-utilization__item-chart" lg={7} md={7} sm={7} xs={7}>
          {isLoading && <LoadingComponent />}
          {!isLoading && data && <SparklineChart id={id} data={chartData} axis={axis} unloadBeforeLoad />}
          {!isLoading && !data && NOT_AVAILABLE}
        </Col>
      </Row>
    </div>
  );
};

UtilizationItem.defaultProps = {
  maxY: null,
  data: null,
  LoadingComponent: InlineLoading,
  isLoading: false,
};

UtilizationItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.array,
  unit: PropTypes.string.isRequired,
  maxY: PropTypes.number,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  isLoading: PropTypes.bool,
};

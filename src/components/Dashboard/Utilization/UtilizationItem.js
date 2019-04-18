import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Measure from 'react-measure';

import { Col, Row } from 'patternfly-react';
import { ChartArea, ChartVoronoiContainer, Chart, ChartAxis, ChartTooltip } from '@patternfly/react-charts';

import { MEDIA_QUERY_SM } from '../../../utils';

import { InlineLoading } from '../../Loading';
import { NOT_AVAILABLE } from './strings';

export class UtilizationItem extends React.PureComponent {
  state = {
    dimensions: {
      width: -1,
    },
  };

  onResize = contentRect => {
    this.setState({ dimensions: contentRect.bounds });
  };

  render() {
    const { id, title, data, maxY, unit, isLoading, LoadingComponent } = this.props;
    const { width } = this.state.dimensions;

    const axis = {
      y: {
        show: true,
        padding: {
          top: 0,
          bottom: 0,
        },
        tick: {
          count: 3,
          format: v => `${v} ${unit}`,
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
    let chart = NOT_AVAILABLE;
    if (isLoading) {
      chart = <LoadingComponent />;
    } else if (data) {
      const chartData = data.map((val, index) => ({ x: index, y: val ? Number(val.toFixed(1)) : 0 }));
      actual = `${Math.round(data[data.length - 1])} ${unit}`;
      chart = (
        <Chart
          id={id}
          height={60}
          width={300}
          containerComponent={
            <ChartVoronoiContainer
              labels={datum => `${datum.y} ${unit}`}
              labelComponent={<ChartTooltip style={{ fontSize: 12, padding: 5 }} />}
            />
          }
          padding={{ top: 10, left: 40, bottom: 5 }}
          domainPadding={{ x: 0, y: 10 }}
        >
          <ChartArea data={chartData} />
          <ChartAxis dependentAxis tickValues={[0, maxY / 2, maxY]} style={{ tickLabels: { fontSize: 10 } }} />
        </Chart>
      );
    }

    let topClass;
    let rows;
    if (width < MEDIA_QUERY_SM) {
      topClass = 'kubevirt-utilization__item-narrow';
      rows = (
        <Fragment>
          <Row>
            <Col lg={6} md={6} sm={6} xs={6} className="kubevirt-utilization__item-narrow-title">
              {title}
            </Col>
            <Col className="kubevirt-utilization__item-actual item-actual--narrow" lg={6} md={6} sm={6} xs={6}>
              {actual}
            </Col>
          </Row>
          <Row>
            <Col className="kubevirt-utilization__item-chart kubevirt-utilization__item-chart--narrow">{chart}</Col>
          </Row>
        </Fragment>
      );
    } else {
      topClass = 'kubevirt-utilization__item';
      rows = (
        <Row>
          <Col lg={3} md={3} sm={3} xs={3}>
            {title}
          </Col>
          <Col className="kubevirt-utilization__item-actual" lg={2} md={2} sm={2} xs={2}>
            {actual}
          </Col>
          <Col
            className="kubevirt-utilization__item-chart kubevirt-utilization__item-chart--wide"
            lg={7}
            md={7}
            sm={7}
            xs={7}
          >
            {chart}
          </Col>
        </Row>
      );
    }

    return (
      <Measure bounds onResize={this.onResize}>
        {({ measureRef }) => (
          <div ref={measureRef} className={topClass}>
            {rows}
          </div>
        )}
      </Measure>
    );
  }
}

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

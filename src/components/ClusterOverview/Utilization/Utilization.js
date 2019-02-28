import React from 'react';
import { SparklineChart, Row, Col } from 'patternfly-react';
import PropTypes from 'prop-types';

const UtilizationItem = ({ id, title, data, unit }) => (
  <div key={id} className="kubevirt-utilization__item">
    <Row>
      <Col lg={2} md={2} sm={2} xs={2}>
        <h2>{title}</h2>
      </Col>
      <Col lg={3} md={3} sm={3} xs={3}>
        <h2>{`${data[data.length - 1]} ${unit}`}</h2>
      </Col>
      <Col lg={7} md={7} sm={7} xs={7}>
        <SparklineChart
          id={id}
          data={{
            columns: [[unit, ...data]],
            unload: true,
            type: 'area',
          }}
          unloadBeforeLoad
          size={{ width: 430, height: 70 }}
        />
      </Col>
    </Row>
  </div>
);

UtilizationItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  unit: PropTypes.string.isRequired,
};

export class Utilization extends React.PureComponent {
  render() {
    const { stats } = this.props;
    return Object.keys(stats).map(key => (
      <UtilizationItem id={key} title={stats[key].title} data={stats[key].data} unit={stats[key].unit} />
    ));
  }
}

Utilization.title = 'Cluster utilization';

Utilization.propTypes = {
  stats: PropTypes.object.isRequired,
};

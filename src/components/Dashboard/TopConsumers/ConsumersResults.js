import React from 'react';
import { Row, Col } from 'patternfly-react';
import PropTypes from 'prop-types';

import { InlineLoading } from '../../Loading';

export const ConsumersResults = ({ type, description, children, isLoading, LoadingComponent }) => {
  let results = 'Not available';
  if (isLoading) {
    results = <LoadingComponent />;
  } else if (children) {
    results = children;
  }

  return (
    <div className="kubevirt-consumers__results">
      {type && description && (
        <Row className="kubevirt-consumers__description">
          <Col lg={4} md={4} sm={4} xs={4} className="kubevirt-consumers__metric-type">
            {type}
          </Col>
          <Col lg={8} md={8} sm={8} xs={8} className="kubevirt-consumers__metric-description">
            {description}
          </Col>
        </Row>
      )}
      {results}
    </div>
  );
};

ConsumersResults.defaultProps = {
  type: null,
  description: null,
  isLoading: false,
  LoadingComponent: InlineLoading,
  children: null,
};

ConsumersResults.propTypes = {
  type: PropTypes.string,
  description: PropTypes.string,
  isLoading: PropTypes.bool,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

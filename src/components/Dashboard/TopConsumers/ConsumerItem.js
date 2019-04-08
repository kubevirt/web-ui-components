import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, OverlayTrigger, ProgressBar, Tooltip } from 'patternfly-react';

export const ConsumerItem = ({ now, description, label }) => (
  <Row className="kubevirt-consumers__bar">
    <Col lg={4} md={4} sm={4} xs={4}>
      <OverlayTrigger
        overlay={<Tooltip id={`tooltip-for-${description}`}>{description}</Tooltip>}
        placement="top"
        trigger={['hover', 'focus']}
        rootClose={false}
      >
        <div className="kubevirt-consumers__bar-description">{description}</div>
      </OverlayTrigger>
    </Col>
    <Col lg={5} md={5} sm={5} xs={5} className="kubevirt-consumers__bar-column-progress">
      <div className="progress kubevirt-consumers__bar-progress">
        <ProgressBar min={0} max={100} now={now} key={1} isChild />
        <ProgressBar min={0} max={100} now={100 - now} key={2} bsClass="progress-bar progress-bar-remaining" isChild />
      </div>
    </Col>
    <Col lg={3} md={3} sm={3} xs={3} className="kubevirt-consumers__bar-label">
      <OverlayTrigger
        overlay={<Tooltip id={`tooltip-for-${label}`}>{label}</Tooltip>}
        placement="top"
        trigger={['hover', 'focus']}
        rootClose={false}
      >
        <span>{label}</span>
      </OverlayTrigger>
    </Col>
  </Row>
);

ConsumerItem.propTypes = {
  now: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

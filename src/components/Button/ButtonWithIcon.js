import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Col } from 'patternfly-react';

export const ButtonWithIcon = ({ onClick, iconType, icon, label }) => (
  <Button onClick={onClick} bsClass="btn btn-link btn-with-icon">
    <Col md={12}>
      <Icon type={iconType} name={icon} className="fa-5x" />
    </Col>
    <Col md={12} className="label-column">
      <span className="lead">{label}</span>
    </Col>
  </Button>
);

ButtonWithIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  iconType: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

export const HealthItem = ({ icon, classname, message, details, isRow }) => (
  <div className={isRow ? 'kubevirt-health__body kubevirt-health__row' : 'kubevirt-health__body'}>
    <Icon type="fa" size="2x" name={icon} className={`kubevirt-health__icon kubevirt-health__icon--${classname}`} />
    <div className="kubevirt-health__message">
      <div className="kubevirt-health__title">{message}</div>
      <div className="kubevirt-health__title kubevirt-health__subtitle">{details}</div>
    </div>
  </div>
);

HealthItem.defaultProps = {
  isRow: false,
  details: '',
};

HealthItem.propTypes = {
  message: PropTypes.string.isRequired,
  details: PropTypes.string,
  icon: PropTypes.string.isRequired,
  classname: PropTypes.string.isRequired,
  isRow: PropTypes.bool,
};

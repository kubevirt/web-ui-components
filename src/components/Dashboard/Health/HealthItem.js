import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

export const HealthItem = ({ icon, classname, message }) => (
  <div className="kubevirt-health__body">
    <Icon type="fa" size="2x" name={icon} className={`kubevirt-health__icon kubevirt-health__icon--${classname}`} />
    <span className="kubevirt-health__text">{message}</span>
  </div>
);

HealthItem.propTypes = {
  message: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  classname: PropTypes.string.isRequired,
};

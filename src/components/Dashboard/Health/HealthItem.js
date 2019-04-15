import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'patternfly-react';

import { InlineLoading } from '../../Loading';

export const HealthItem = ({ icon, classname, message, isLoading, LoadingComponent }) => {
  const description = isLoading ? <LoadingComponent /> : message;
  return (
    <div className="kubevirt-dashboard-health__icon">
      <Icon type="fa" size="2x" name={icon} className={`kubevirt-dashboard-health__icon--${classname}`} />
      <span className="kubevirt-dashboard-health__row-status-item-text">{description}</span>
    </div>
  );
};

HealthItem.defaultProps = {
  LoadingComponent: InlineLoading,
  isLoading: false,
};

HealthItem.propTypes = {
  message: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  classname: PropTypes.string.isRequired,
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  isLoading: PropTypes.bool,
};

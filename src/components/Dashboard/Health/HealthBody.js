import React from 'react';
import PropTypes from 'prop-types';

export const HealthBody = ({ children }) => <div className="kubevirt-dashboard-health__items">{children}</div>;

HealthBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

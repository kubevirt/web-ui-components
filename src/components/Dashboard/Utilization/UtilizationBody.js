import React from 'react';
import PropTypes from 'prop-types';

export const UtilizationBody = ({ children }) => <div className="kubevirt-utilization__items">{children}</div>;

UtilizationBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

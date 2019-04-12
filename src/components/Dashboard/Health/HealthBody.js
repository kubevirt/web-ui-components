import React from 'react';
import PropTypes from 'prop-types';

export const HealthBody = ({ children }) => <div className="kubevirt-health__body">{children}</div>;

HealthBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';

export const CapacityBody = ({ children }) => <div className="kubevirt-capacity__items">{children}</div>;

CapacityBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';

export const ConsumersFilter = ({ children }) => <div className="kubevirt-consumers__filters">{children}</div>;

ConsumersFilter.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

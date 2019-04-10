import React from 'react';
import PropTypes from 'prop-types';

export const AlertsBody = ({ children }) => <div className="kubevirt-alert__alerts-body">{children}</div>;

AlertsBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

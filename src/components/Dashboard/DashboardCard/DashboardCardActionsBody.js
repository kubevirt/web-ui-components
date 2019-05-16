import React from 'react';
import PropTypes from 'prop-types';

export const DashboardCardActionsBody = ({ children }) => (
  <div className="kubevirt-dashboard__actions-body">{children}</div>
);

DashboardCardActionsBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

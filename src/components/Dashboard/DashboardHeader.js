import React from 'react';
import PropTypes from 'prop-types';

const DashboardHeader = ({ children }) => (
  <div>
    <h1>{children}</h1>
  </div>
);

DashboardHeader.defaultProps = {
  children: null,
};

DashboardHeader.propTypes = {
  children: PropTypes.node,
};

export default DashboardHeader;

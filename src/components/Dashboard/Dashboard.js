import React from 'react';
import PropTypes from 'prop-types';

const Dashboard = ({ children }) => <div>{children}</div>;

Dashboard.defaultProps = {
  children: null,
};

Dashboard.propTypes = {
  children: PropTypes.node,
};

export default Dashboard;

import React from 'react';
import PropTypes from 'prop-types';
import { CardTitle } from 'patternfly-react';

const DashboardCardTitle = ({ children, ...props }) => <CardTitle {...props}>{children}</CardTitle>;

DashboardCardTitle.defaultProps = {
  children: null,
};

DashboardCardTitle.propTypes = {
  children: PropTypes.node,
};

export default DashboardCardTitle;

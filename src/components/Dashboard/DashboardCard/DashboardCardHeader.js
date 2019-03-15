import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CardHeading } from 'patternfly-react';

const DashboardCardHeader = ({ className, children, ...props }) => (
  <CardHeading {...props} className={classNames('kubevirt-dashboard__card-heading', className)}>
    {children}
  </CardHeading>
);

DashboardCardHeader.defaultProps = {
  className: null,
  children: null,
};

DashboardCardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default DashboardCardHeader;

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from 'patternfly-react';

const DashboardCard = ({ className, children, ...props }) => (
  <Card {...props} className={classNames('kubevirt-dashboard__card', className)}>
    {children}
  </Card>
);

DashboardCard.defaultProps = {
  className: null,
  children: null,
};

DashboardCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default DashboardCard;

import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

const DashboardBody = ({ className, children }) => (
  <div className={classNames('kubevirt-dashboard__body', className)}>{children}</div>
);

DashboardBody.defaultProps = {
  className: null,
  children: null,
};

DashboardBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default DashboardBody;

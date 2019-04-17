import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const HealthBody = ({ children, className }) => (
  <div className={classNames('kubevirt-health__body', className)}>{children}</div>
);

HealthBody.defaultProps = {
  className: null,
};

HealthBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

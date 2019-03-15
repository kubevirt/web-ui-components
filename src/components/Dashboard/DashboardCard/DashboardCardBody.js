import React from 'react';
import PropTypes from 'prop-types';

import { CardBody } from 'patternfly-react';

import { Loading } from '../../Loading';

const DashboardCardBody = ({ LoadingComponent, isLoading, children, ...props }) => (
  <CardBody {...props}>{isLoading ? <LoadingComponent /> : children}</CardBody>
);

DashboardCardBody.defaultProps = {
  LoadingComponent: Loading,
  isLoading: false,
  children: null,
};

DashboardCardBody.propTypes = {
  LoadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  isLoading: PropTypes.bool,
  children: PropTypes.node,
};

export default DashboardCardBody;

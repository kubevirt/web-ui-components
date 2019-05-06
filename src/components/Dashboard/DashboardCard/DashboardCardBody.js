import React from 'react';
import PropTypes from 'prop-types';

import { CardBody } from 'patternfly-react';

import { Loading } from '../../Loading';

class DashboardCardBody extends React.PureComponent {
  render() {
    const { LoadingComponent, isLoading, children, ...props } = this.props;
    return <CardBody {...props}>{isLoading ? <LoadingComponent /> : children}</CardBody>;
  }
}

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

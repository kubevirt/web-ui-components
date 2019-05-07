import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CardTitle } from 'patternfly-react';

class DashboardCardTitle extends React.PureComponent {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <CardTitle {...props} className={classNames('kubevirt-dashboard__card-title', className)}>
        {children}
      </CardTitle>
    );
  }
}

DashboardCardTitle.defaultProps = {
  children: null,
  className: null,
};

DashboardCardTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default DashboardCardTitle;

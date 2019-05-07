import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CardHeading } from 'patternfly-react';

class DashboardCardHeader extends React.PureComponent {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <CardHeading {...props} className={classNames('kubevirt-dashboard__card-heading', className)}>
        {children}
      </CardHeading>
    );
  }
}

DashboardCardHeader.defaultProps = {
  className: null,
  children: null,
};

DashboardCardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default DashboardCardHeader;

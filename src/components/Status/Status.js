import React from 'react';
import { Link } from 'react-router-dom';
import { Popover } from '@patternfly/react-core';
import { Icon, Button } from 'patternfly-react';
import PropTypes from 'prop-types';

export const Status = ({ icon, children }) => (
  <React.Fragment>
    {icon && <Icon type="pf" name={icon} className="kubevirt-status__icon" />}
    {children}
  </React.Fragment>
);

Status.defaultProps = {
  icon: null,
};

Status.propTypes = {
  icon: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const PopoverStatus = ({ icon, header, children }) => (
  <Popover position="right" headerContent={header} bodyContent={children}>
    <span className="kubevirt-status__popover">
      <Status icon={icon}>
        <Button className="kubevirt-status__button" bsStyle="link">
          {header}
        </Button>
      </Status>
    </span>
  </Popover>
);

PopoverStatus.defaultProps = {
  icon: null,
};

PopoverStatus.propTypes = {
  icon: PropTypes.string,
  header: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const LinkStatus = ({ icon, children, linkMessage, linkTo }) =>
  linkTo ? (
    <Status icon={icon}>
      <Link to={linkTo} title={linkMessage}>
        {children}
      </Link>
    </Status>
  ) : (
    <Status icon={icon}>{children}</Status>
  );

LinkStatus.defaultProps = {
  icon: null,
  linkMessage: null,
  linkTo: null,
};

LinkStatus.propTypes = {
  icon: PropTypes.string,
  linkMessage: PropTypes.string,
  linkTo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

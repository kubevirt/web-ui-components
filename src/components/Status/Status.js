import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, OverlayTrigger, Button } from 'patternfly-react';
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

export const OverlayStatus = ({ icon, text, overlay }) => (
  <Status icon={icon}>
    <OverlayTrigger overlay={overlay} placement="right" trigger={['click']} rootClose>
      <Button className="kubevirt-status__button" bsStyle="link">
        {text}
      </Button>
    </OverlayTrigger>
  </Status>
);

OverlayStatus.defaultProps = {
  icon: null,
};

OverlayStatus.propTypes = {
  icon: PropTypes.string,
  text: PropTypes.string.isRequired,
  overlay: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
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

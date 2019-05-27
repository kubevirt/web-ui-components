import React from 'react';
import { Link } from 'react-router-dom';
import { Popover, Progress, ProgressVariant, ProgressSize } from '@patternfly/react-core';
import { Icon, Button } from 'patternfly-react';
import PropTypes from 'prop-types';

import { STATUS_DANGER, STATUS_SUCCESS, STATUS_INFO } from '../../utils/status/common';

const StatusField = ({ content }) => <div className="kubevirt-status__field">{content}</div>;
StatusField.propTypes = {
  content: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const StatusDescriptionField = ({ title, content }) => (
  <StatusField
    content={
      <React.Fragment>
        {title ? <div className="kubevirt-status__field-header">{title}</div> : ''}
        <div className="kubevirt-status__field-description">{content}</div>
      </React.Fragment>
    }
  />
);
StatusDescriptionField.defaultProps = {
  title: null,
};
StatusDescriptionField.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string.isRequired,
};

export const StatusLinkField = ({ title, linkTo }) => (
  <StatusField
    content={
      <div className="kubevirt-status__field-link">
        <Link to={linkTo} title={title}>
          {title || linkTo}
        </Link>
      </div>
    }
  />
);
StatusLinkField.defaultProps = {
  title: null,
};
StatusLinkField.propTypes = {
  title: PropTypes.string,
  linkTo: PropTypes.string.isRequired,
};

export const StatusProgressField = ({ title, progress, barType }) => {
  const variants = {
    STATUS_INFO: ProgressVariant.info,
    STATUS_SUCCESS: ProgressVariant.success,
    STATUS_DANGER: ProgressVariant.danger,
  };
  return (
    <StatusField
      content={
        <Progress
          className="kubevirt-status__field-progress"
          value={progress}
          title={title}
          variant={variants[barType] || ProgressVariant.info}
          size={ProgressSize.sm}
        />
      }
    />
  );
};
StatusProgressField.defaultProps = {
  title: null,
  barType: STATUS_INFO,
};
StatusProgressField.propTypes = {
  title: PropTypes.string,
  barType: PropTypes.oneOf([STATUS_INFO, STATUS_SUCCESS, STATUS_DANGER]),
  progress: PropTypes.number.isRequired,
};

export const Status = ({ icon, children, iconType }) => (
  <React.Fragment>
    {icon && <Icon type={iconType || 'pf'} name={icon} className="kubevirt-status__icon" />}
    {children}
  </React.Fragment>
);
Status.defaultProps = {
  icon: null,
  iconType: null,
};
Status.propTypes = {
  icon: PropTypes.string,
  iconType: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const PopoverStatus = ({ icon, iconType, header, children }) => (
  <Popover position="right" headerContent={header} bodyContent={children}>
    <span className="kubevirt-status__popover">
      <Status icon={icon} iconType={iconType}>
        <Button className="kubevirt-status__button" bsStyle="link">
          {header}
        </Button>
      </Status>
    </span>
  </Popover>
);
PopoverStatus.defaultProps = {
  icon: null,
  iconType: null,
};
PopoverStatus.propTypes = {
  icon: PropTypes.string,
  iconType: PropTypes.string,
  header: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Popover, Progress, ProgressVariant, ProgressSize } from '@patternfly/react-core';
import { Icon, Button } from 'patternfly-react';
import PropTypes from 'prop-types';

const StatusField = ({ children }) => <div className="kubevirt-status__field">{children}</div>;
StatusField.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const StatusDescriptionField = ({ title, children }) => (
  <StatusField>
    {title && <div className="kubevirt-status__field-header">{title}</div>}
    <div className="kubevirt-status__field-description">{children}</div>
  </StatusField>
);
StatusDescriptionField.defaultProps = {
  title: null,
};
StatusDescriptionField.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
};

export const StatusLinkField = ({ title, linkTo }) => (
  <StatusField>
    <div className="kubevirt-status__field-link">
      <Link to={linkTo} title={title}>
        {title || linkTo}
      </Link>
    </div>
  </StatusField>
);
StatusLinkField.defaultProps = {
  title: null,
};
StatusLinkField.propTypes = {
  title: PropTypes.string,
  linkTo: PropTypes.string.isRequired,
};

export const StatusProgressField = ({ title, progress, barType }) => (
  <StatusField>
    <Progress
      className="kubevirt-status__field-progress"
      value={progress}
      title={title}
      variant={barType || ProgressVariant.info}
      size={ProgressSize.sm}
    />
  </StatusField>
);
StatusProgressField.defaultProps = {
  title: null,
  barType: null,
};
StatusProgressField.propTypes = {
  title: PropTypes.string,
  barType: PropTypes.oneOf([ProgressVariant.info, ProgressVariant.success, ProgressVariant.danger]),
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

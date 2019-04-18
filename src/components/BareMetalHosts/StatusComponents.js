import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@patternfly/react-core';
import { Icon } from 'patternfly-react';

export const IconAndText = ({ icon, text }) => (
  <React.Fragment>
    <Icon type="pf" name={icon} className="kubevirt-host-status__icon" />
    {text}
  </React.Fragment>
);

IconAndText.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

// Generic status component as a fallback
export const GenericStatus = ({ status, text, errorMessage }) => text;

GenericStatus.propTypes = {
  status: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
};

GenericStatus.defaultProps = {
  errorMessage: undefined,
};

// Generic success status component
export const GenericSuccess = ({ status, text, errorMessage }) => <IconAndText icon="ok" text={text} />;

GenericSuccess.propTypes = GenericStatus.propTypes;
GenericSuccess.defaultProps = GenericStatus.defaultProps;

// Generic error status component
// If the errorMessage property isn't empty its contents are
// shown in a Popover.
export const GenericError = ({ status, text, errorMessage }) =>
  errorMessage ? (
    <Popover position="right" size="regular" headerContent={<div>Errors</div>} bodyContent={errorMessage}>
      <IconAndText icon="error-circle-o" text={text} />
    </Popover>
  ) : (
    <IconAndText icon="error-circle-o" text={text} />
  );

GenericError.propTypes = GenericStatus.propTypes;
GenericError.defaultProps = GenericStatus.defaultProps;

// Generic progress status component
export const GenericProgress = ({ status, text, errorMessage }) => <IconAndText icon="in-progress" text={text} />;

GenericProgress.propTypes = GenericStatus.propTypes;
GenericProgress.defaultProps = GenericStatus.defaultProps;

// Validation Error component
// (TODO) Add details for validation errors in Popover component
export const ValidationError = ({ status, text, errorMessage }) => (
  <Popover position="right" size="regular" headerContent={<div>Errors</div>} bodyContent={errorMessage}>
    <IconAndText icon="error-circle-o" text={text} />
  </Popover>
);

ValidationError.propTypes = {
  status: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

export const AddDiscoveredHostLink = host => (
  <a>
    <IconAndText icon="add-circle-o" text="Add host" />
  </a>
);

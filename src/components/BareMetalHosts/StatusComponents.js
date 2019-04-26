import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@patternfly/react-core';

import { Status, OverlayStatus } from '../Status';

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
export const GenericSuccess = ({ status, text, errorMessage }) => <Status icon="ok">{text}</Status>;

GenericSuccess.propTypes = GenericStatus.propTypes;
GenericSuccess.defaultProps = GenericStatus.defaultProps;

const ErrorOverlay = ({ errorMessage }) => (
  <Popover position="right" size="regular" title="Errors">
    <div>{errorMessage}</div>
  </Popover>
);

ErrorOverlay.propTypes = {
  errorMessage: PropTypes.string,
};

ErrorOverlay.defaultProps = {
  errorMessage: null,
};

// Generic error status component
// If the errorMessage property isn't empty its contents are
// shown in a Popover.
export const GenericError = ({ status, text, errorMessage }) =>
  errorMessage ? (
    <OverlayStatus icon="error-circle-o" text={text} overlay={<ErrorOverlay errorMessage={errorMessage} />} />
  ) : (
    <Status icon="error-circle-o">{text}</Status>
  );

GenericError.propTypes = GenericStatus.propTypes;
GenericError.defaultProps = GenericStatus.defaultProps;

// Generic progress status component
export const GenericProgress = ({ status, text, errorMessage }) => <Status icon="in-progress">{text}</Status>;

GenericProgress.propTypes = GenericStatus.propTypes;
GenericProgress.defaultProps = GenericStatus.defaultProps;

// Validation Error component
// (TODO) Add details for validation errors in Popover component
export const ValidationError = ({ status, text, errorMessage }) => (
  <OverlayStatus icon="error-circle-o" text={text} overlay={<ErrorOverlay errorMessage={errorMessage} />} />
);

ValidationError.propTypes = {
  status: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

export const AddDiscoveredHostLink = host => (
  <a>
    <Status icon="add-circle-o">Add host</Status>
  </a>
);

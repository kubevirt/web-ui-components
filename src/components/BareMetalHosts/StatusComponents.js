import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@patternfly/react-core';

import { Status, PopoverStatus } from '../Status';

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

// Generic error status component
// If the errorMessage property isn't empty its contents are
// shown in a Popover.
export const GenericError = ({ status, text, errorMessage }) =>
  errorMessage ? (
    <PopoverStatus icon="error-circle-o" header={<div>{text}</div>}>
      <div>{errorMessage}</div>
    </PopoverStatus>
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
  <PopoverStatus icon="error-circle-o" header={<div>{text}</div>}>
    <div>{errorMessage}</div>
  </PopoverStatus>
);

ValidationError.propTypes = {
  status: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
};

export class AddDiscoveredHostLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.togglePopover = () => {
      this.setState(previousState => ({ visible: !previousState.visible }));
    };
    this.addHostClick = () => {
      this.togglePopover();
      this.props.onAddHost();
    };
  }

  render() {
    return (
      <Popover
        position="right"
        size="regular"
        isVisible={this.state.visible}
        shouldClose={this.togglePopover}
        headerContent={<div>Discovered Host</div>}
        bodyContent={
          <React.Fragment>
            <p>This host has been discovered on the network but has not been added to the cluster.</p>
            <p>
              <a onClick={this.addHostClick}>Add Host</a>
            </p>
          </React.Fragment>
        }
      >
        <a onClick={this.togglePopover}>
          <Status icon="add-circle-o">Discovered</Status>
        </a>
      </Popover>
    );
  }
}

AddDiscoveredHostLink.propTypes = {
  onAddHost: PropTypes.func.isRequired,
};

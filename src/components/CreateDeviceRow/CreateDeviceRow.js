import React from 'react';
import PropTypes from 'prop-types';

import { ListFormFactory } from '../Form/FormFactory';
import { CancelAcceptButtons } from '../CancelAcceptButtons';

const getActions = (valid, device, LoadingComponent, onAccept, onCancel) =>
  device.creating ? (
    <LoadingComponent />
  ) : (
    <CancelAcceptButtons onAccept={onAccept} onCancel={onCancel} disabled={!valid} />
  );

export class CreateDeviceRow extends React.Component {
  state = {
    valid: false,
  };

  onFormChange = (newValue, key, valid) => {
    this.props.onChange(newValue, key);
    this.setState({
      valid,
    });
  };

  render() {
    const { device, onAccept, onCancel, LoadingComponent, deviceFields, columnSizes } = this.props;
    const actions = getActions(this.state.valid, device, LoadingComponent, onAccept, onCancel);
    return (
      <ListFormFactory
        fields={deviceFields}
        fieldsValues={device}
        actions={actions}
        onFormChange={this.onFormChange}
        columnSizes={columnSizes}
      />
    );
  }
}

CreateDeviceRow.propTypes = {
  device: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.func.isRequired,
  deviceFields: PropTypes.object.isRequired,
  columnSizes: PropTypes.object.isRequired,
};

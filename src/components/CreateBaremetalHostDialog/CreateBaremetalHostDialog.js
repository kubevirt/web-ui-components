import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Col, Button, Alert } from 'patternfly-react';

import { FormFactory } from '../Form/FormFactory';
import { createBaremetalHost } from '../../k8s/request';
import { TinyInlineLoading } from '../Loading/Loading';
import { CREATE_HOST_FORM_TEXT } from './strings';

const formFields = {
  name: {
    id: 'name',
    title: 'Name',
    required: false,
  },
  controller: {
    id: 'controller',
    title: 'Management Controller Address',
    required: true,
  },
  username: {
    id: 'username',
    title: 'Username',
    required: true,
  },
  password: {
    id: 'password',
    title: 'Password',
    type: 'password',
    required: true,
  },
};

export class CreateBaremetalHostDialog extends React.Component {
  state = {
    form: {
      value: {},
      valid: false,
    },
    isSubmitting: false,
    errorMessage: null,
  };

  onFormChange = (newValue, target, formValid) => {
    this.setState(state => {
      const form = { ...state.form };
      form.value[target] = {
        ...newValue,
      };
      form.valid = formValid;
      return { form, errorMessage: null };
    });
  };

  onSubmit = async () => {
    this.setState(state => ({
      ...state,
      isSubmitting: true,
    }));

    return createBaremetalHost(this.props.k8sCreate, this.state.form.value, this.props.selectedNamespace)
      .then(result => {
        this.setState(state => ({
          ...state,
          isSubmitting: false,
        }));
        this.props.onClose();
        return result;
      })
      .catch(({ message }) => {
        this.setState(state => ({
          ...state,
          isSubmitting: false,
          errorMessage: message,
        }));
      });
  };

  render() {
    return (
      <Modal show bsSize="large" onHide={this.props.onClose} className="kubevirt-create-baremetal-host-dialog">
        <Modal.Header closeButton>
          <Modal.Title>Add Host</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col sm={12}>
            <p className="kubevirt-create-baremetal-host-dialog--paragraph">{CREATE_HOST_FORM_TEXT}</p>
            <FormFactory
              fields={formFields}
              fieldsValues={this.state.form.value}
              onFormChange={this.onFormChange}
              horizontal={false}
            />
          </Col>
        </Modal.Body>
        <Modal.Footer>
          {this.state.errorMessage && <Alert type="error">{this.state.errorMessage}</Alert>}
          {this.state.isSubmitting && <TinyInlineLoading />}
          <Button bsStyle="default" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button
            bsStyle="primary"
            disabled={!this.state.form.valid || this.state.isSubmitting}
            onClick={this.onSubmit}
          >
            Add Host
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

CreateBaremetalHostDialog.defaultProps = {
  selectedNamespace: null,
};

CreateBaremetalHostDialog.propTypes = {
  k8sCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedNamespace: PropTypes.object,
};

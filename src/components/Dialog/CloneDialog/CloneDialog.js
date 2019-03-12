import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Modal, Button, Icon, Alert } from 'patternfly-react';

import { ConfigurationSummary } from '../../ConfigurationSummary';
import { FormFactory, CUSTOM, CHECKBOX, DROPDOWN, TEXT_AREA } from '../../Form';
import { NAME_KEY, DESCRIPTION_KEY, NAMESPACE_KEY, START_VM_KEY } from '../../Wizard/CreateVmWizard/constants';
import { getDescription, getNamespace, getName } from '../../../selectors';
import { validateDNS1123SubdomainValue, getValidationObject } from '../../../utils/validations';
import { settingsValue } from '../../../k8s/selectors';
import { clone } from '../../../k8s/clone';
import { Loading } from '../../Loading';
import { VALIDATION_ERROR_TYPE } from '../../../constants';
import { VIRTUAL_MACHINE_EXISTS } from '../../../utils/strings';
import { isRunning, VM_STATUS_OFF } from '../../../utils/status/vm';

const vmAlreadyExists = (name, namespace, vms) => {
  const exists = vms.some(vm => getName(vm) === name && getNamespace(vm) === namespace);
  return exists ? getValidationObject(VIRTUAL_MACHINE_EXISTS) : null;
};

const getFormFields = (namespaces, vm, persistentVolumeClaims, dataVolumes, virtualMachines) => ({
  [NAME_KEY]: {
    id: 'vm-name',
    title: 'Name',
    required: true,
    validate: settings => {
      const name = settingsValue(settings, NAME_KEY);
      const dnsValidation = validateDNS1123SubdomainValue(name);
      return dnsValidation && dnsValidation.type === VALIDATION_ERROR_TYPE
        ? dnsValidation
        : vmAlreadyExists(name, settingsValue(settings, NAMESPACE_KEY), virtualMachines);
    },
  },
  [DESCRIPTION_KEY]: {
    id: 'vm-description',
    title: 'Description',
    type: TEXT_AREA,
  },
  [NAMESPACE_KEY]: {
    id: 'namespace-dropdown',
    title: 'Namespace',
    type: DROPDOWN,
    defaultValue: '--- Select Namespace ---',
    choices: namespaces.map(getName),
    required: true,
  },
  [START_VM_KEY]: {
    id: 'start-vm',
    title: 'Start virtual machine on clone',
    type: CHECKBOX,
    noBottom: true,
  },
  configuration: {
    id: 'vm-configuration',
    title: 'Configuration',
    type: CUSTOM,
    CustomComponent: () => (
      <ConfigurationSummary vm={vm} persistentVolumeClaims={persistentVolumeClaims} dataVolumes={dataVolumes} />
    ),
  },
});

const vmIsRunning = vm => get(isRunning(vm), 'status') !== VM_STATUS_OFF;

export class CloneDialog extends React.Component {
  constructor(props) {
    super(props);
    const initVmName = `${getName(props.vm)}-clone`;
    const initVmNameValidation = vmAlreadyExists(initVmName, getNamespace(props.vm), props.virtualMachines);
    if (initVmNameValidation && initVmNameValidation.message) {
      initVmNameValidation.message = `Name ${initVmNameValidation.message}`;
    }
    this.state = {
      [NAME_KEY]: {
        value: initVmName,
        validation: initVmNameValidation,
      },
      [DESCRIPTION_KEY]: {
        value: getDescription(props.vm),
      },
      [NAMESPACE_KEY]: {
        value: getNamespace(props.vm),
      },
      [START_VM_KEY]: {
        value: false,
      },
      valid: !initVmNameValidation,
      cloning: false,
    };
  }

  onFormChange = (formFields, newValue, key, valid) => {
    const newSettings = {
      ...this.state,
      [key]: newValue,
      valid,
    };

    if (key === NAMESPACE_KEY) {
      const validation = formFields[NAME_KEY].validate(newSettings);
      if (validation && validation.message) {
        validation.message = `Name ${validation.message}`;
      }
      newSettings[NAME_KEY] = {
        ...(newSettings[NAME_KEY] || {}),
        validation,
      };
    }

    this.setState(newSettings);
  };

  cloneVm = () => {
    this.setState({
      cloning: true,
    });
    clone(
      this.props.k8sCreate,
      this.props.k8sPatch,
      this.props.vm,
      settingsValue(this.state, NAME_KEY),
      settingsValue(this.state, NAMESPACE_KEY),
      settingsValue(this.state, DESCRIPTION_KEY),
      settingsValue(this.state, START_VM_KEY),
      this.props.persistentVolumeClaims,
      this.props.dataVolumes
    )
      .then(() => this.props.onClose())
      .catch(error =>
        this.setState({
          cloning: false,
          error: error.message || 'Error occured, please try again later.',
        })
      );
  };

  onErrorDismissed = () => this.setState({ error: null });

  render() {
    const formFields = getFormFields(
      this.props.namespaces,
      this.props.vm,
      this.props.persistentVolumeClaims,
      this.props.dataVolumes,
      this.props.virtualMachines
    );
    const { LoadingComponent } = this.props;
    const footer = this.state.cloning ? (
      <LoadingComponent />
    ) : (
      <React.Fragment>
        <Button bsStyle="default" className="btn-cancel" onClick={this.props.onClose}>
          Cancel
        </Button>
        <Button bsStyle="primary" onClick={this.cloneVm} disabled={!this.state.valid}>
          Clone Virtual Machine
        </Button>
      </React.Fragment>
    );
    return (
      <Modal show dialogClassName="kubevirt-clone-dialog">
        <Modal.Header>
          <Button className="close" onClick={this.props.onClose}>
            <Icon type="pf" name="close" />
          </Button>
          <Modal.Title>Clone Virtual Machine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="kubevirt-clone-dialog__content">
            {vmIsRunning(this.props.vm) && (
              <Alert type="warning">
                The VM {getName(this.props.vm)} is still running. It will be powered off while cloning.
              </Alert>
            )}
            {this.state.error && <Alert onDismiss={this.onErrorDismissed}>{this.state.error}</Alert>}
            <FormFactory
              fields={formFields}
              fieldsValues={this.state}
              onFormChange={(newValue, key, valid) => this.onFormChange(formFields, newValue, key, valid)}
              labelSize={2}
              controlSize={10}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>{footer}</Modal.Footer>
      </Modal>
    );
  }
}

CloneDialog.propTypes = {
  vm: PropTypes.object.isRequired,
  namespaces: PropTypes.array.isRequired,
  persistentVolumeClaims: PropTypes.array.isRequired,
  LoadingComponent: PropTypes.func,
  virtualMachines: PropTypes.array.isRequired,
  k8sCreate: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  dataVolumes: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

CloneDialog.defaultProps = {
  LoadingComponent: Loading,
};

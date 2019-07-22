import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Icon, Alert } from 'patternfly-react';

import { ConfigurationSummary } from '../../ConfigurationSummary';
import { FormFactory, CUSTOM, CHECKBOX, DROPDOWN, TEXT_AREA } from '../../Form';
import {
  NAME_KEY,
  DESCRIPTION_KEY,
  NAMESPACE_KEY,
  START_VM_KEY,
  VIRTUAL_MACHINES_KEY,
} from '../../Wizard/CreateVmWizard/constants';
import { getDescription, getNamespace, getName, isVmRunning, getVolumes } from '../../../selectors';
import { validateVmName, vmAlreadyExists } from '../../../utils/validations';
import { settingsValue } from '../../../k8s/selectors';
import { clone } from '../../../k8s/clone';
import { getResource } from '../../../utils/utils';
import { Loading } from '../../Loading';
import { DataVolumeModel, NamespaceModel, PersistentVolumeClaimModel, VirtualMachineModel } from '../../../models';

const getFormFields = (namespaces, vm, persistentVolumeClaims, dataVolumes, virtualMachines) => ({
  [NAME_KEY]: {
    id: 'vm-name',
    title: 'Name',
    required: true,
    validate: settings =>
      validateVmName(settingsValue(settings, NAME_KEY), settings, { [VIRTUAL_MACHINES_KEY]: virtualMachines }),
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

const getLoadedData = (result, defaultValue) =>
  result && result.loaded && !result.loadError ? result.data : defaultValue;

export class CloneDialog extends React.Component {
  constructor(props) {
    super(props);
    const initVmName = `${getName(props.vm)}-clone`;
    const initVmNameValidation = vmAlreadyExists(
      initVmName,
      getNamespace(props.vm),
      getLoadedData(props.virtualMachines, [])
    );
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
      getLoadedData(this.props.persistentVolumeClaims, []),
      getLoadedData(this.props.dataVolumes, [])
    )
      .then(() => this.props.close())
      .catch(error =>
        this.setState({
          cloning: false,
          error: error.message || 'Error occured, please try again later.',
        })
      );
  };

  onErrorDismissed = () => this.setState({ error: null });

  render() {
    const {
      LoadingComponent,
      vm,
      virtualMachines,
      namespaces,
      persistentVolumeClaims,
      dataVolumes,
      requestsDatavolumes,
      requestsPVCs,
      loadError,
    } = this.props;

    const formFields = getFormFields(
      getLoadedData(namespaces, []),
      vm,
      getLoadedData(persistentVolumeClaims, []),
      getLoadedData(dataVolumes, []),
      getLoadedData(virtualMachines, [])
    );

    const dataVolumesValid = requestsDatavolumes ? dataVolumes && dataVolumes.loaded && !dataVolumes.loadError : true;
    const pvcsValid = requestsPVCs
      ? persistentVolumeClaims && persistentVolumeClaims.loaded && !persistentVolumeClaims.loadError
      : true;

    const footer = this.state.cloning ? (
      <LoadingComponent />
    ) : (
      <React.Fragment>
        <Button bsStyle="default" className="btn-cancel" onClick={this.props.cancel}>
          Cancel
        </Button>
        <Button
          bsStyle="primary"
          onClick={this.cloneVm}
          disabled={!(this.state.valid && dataVolumesValid && pvcsValid)}
        >
          Clone Virtual Machine
        </Button>
      </React.Fragment>
    );
    return (
      <Modal show dialogClassName="kubevirt-clone-dialog">
        <Modal.Header>
          <Button className="close" onClick={this.props.close}>
            <Icon type="pf" name="close" />
          </Button>
          <Modal.Title>Clone Virtual Machine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="kubevirt-clone-dialog__content">
            {loadError && <Alert type="error">{loadError.message}</Alert>}
            {isVmRunning(this.props.vm) && (
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
  k8sCreate: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  namespaces: PropTypes.object,
  persistentVolumeClaims: PropTypes.object,
  virtualMachines: PropTypes.object,
  dataVolumes: PropTypes.object,
  requestsDatavolumes: PropTypes.bool,
  requestsPVCs: PropTypes.bool,
  loadError: PropTypes.object,
  LoadingComponent: PropTypes.func,
  close: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};

CloneDialog.defaultProps = {
  LoadingComponent: Loading,
  namespaces: null,
  persistentVolumeClaims: null,
  virtualMachines: null,
  dataVolumes: null,
  requestsDatavolumes: false,
  requestsPVCs: false,
  loadError: null,
};

// eslint-disable-next-line react/no-multi-comp
export class CloneVMModalFirehose extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      namespace: getNamespace(props.vm),
    };
  }

  render() {
    const { vm, Firehose } = this.props;
    const { namespace } = this.state;

    const requestsDatavolumes = !!getVolumes(vm).find(v => v.dataVolume && v.dataVolume.name);
    const requestsPVCs = !!getVolumes(vm).find(v => v.persistentVolumeClaim && v.persistentVolumeClaim.claimName);

    const resources = [
      getResource(NamespaceModel, { prop: 'namespaces' }),
      getResource(VirtualMachineModel, { namespace, prop: 'virtualMachines' }),
    ];

    if (requestsPVCs) {
      resources.push(getResource(PersistentVolumeClaimModel, { namespace, prop: 'persistentVolumeClaims' }));
    }

    if (requestsDatavolumes) {
      resources.push(getResource(DataVolumeModel, { namespace, prop: 'dataVolumes' }));
    }

    return (
      <Firehose resources={resources}>
        <CloneDialog
          {...this.props}
          onNamespaceChanged={n => this.setState({ namespace: n })}
          requestsDatavolumes={requestsDatavolumes}
          requestsPVCs={requestsPVCs}
        />
      </Firehose>
    );
  }
}

CloneVMModalFirehose.propTypes = {
  vm: PropTypes.object.isRequired,
  Firehose: PropTypes.object.isRequired,
  LoadingComponent: PropTypes.func,
  k8sCreate: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};

CloneVMModalFirehose.defaultProps = {
  LoadingComponent: Loading,
};

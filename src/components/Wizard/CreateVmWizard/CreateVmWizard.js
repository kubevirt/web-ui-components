import React from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import { Wizard } from 'patternfly-react';

import BasicSettingsTab from './BasicSettingsTab';
import StorageTab from './StorageTab';
import ResultTab from './ResultTab';

import { createVm, createVmTemplate } from '../../../k8s/request';
import {
  POD_NETWORK,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_PXE,
} from '../../../constants';
import { NetworksTab } from './NetworksTab';
import { settingsValue } from '../../../k8s/selectors';
import {
  PROVISION_SOURCE_TYPE_KEY,
  USER_TEMPLATE_KEY,
  BASIC_SETTINGS_TAB_KEY,
  NETWORKS_TAB_KEY,
  STORAGE_TAB_KEY,
  RESULT_TAB_KEY,
  STORAGE_TYPE_CONTAINER,
  STORAGE_TYPE_DATAVOLUME,
  NETWORK_TYPE_POD,
} from './constants';
import {
  CREATE_VM,
  CREATE_VM_TEMPLATE,
  STEP_BASIC_SETTINGS,
  STEP_NETWORK,
  STEP_STORAGE,
  STEP_RESULT,
  NEXT,
} from './strings';
import { loadingWizardTab } from '../loadingWizardTab';
import {
  getUserTemplate,
  getTemplateStorages,
  getTemplateInterfaces,
  hasAutoAttachPodInterface,
} from '../../../utils/templates';

const LoadingBasicWizardTab = loadingWizardTab(BasicSettingsTab);
const LoadingStorageTab = loadingWizardTab(StorageTab);
const LoadingNetworksTab = loadingWizardTab(NetworksTab);

const getBasicSettingsValue = (stepData, key) => settingsValue(stepData[BASIC_SETTINGS_TAB_KEY].value, key);

const onUserTemplateChangedInStorageTab = (stepData, newUserTemplate) => {
  const withoutDiscardedTemplateStorage = stepData[STORAGE_TAB_KEY].value.filter(storage => !storage.templateStorage);

  const rows = [...withoutDiscardedTemplateStorage];

  if (newUserTemplate) {
    const templateStorages = getTemplateStorages(newUserTemplate).map(storage => ({
      templateStorage: storage,
    }));
    rows.push(...templateStorages);
  }

  return {
    ...stepData,
    [STORAGE_TAB_KEY]: {
      ...stepData[STORAGE_TAB_KEY],
      value: rows,
    },
  };
};

const onUserTemplateChangedInNetworksTab = (stepData, newUserTemplate) => {
  const withoutDiscardedTemplateNetworks = stepData[NETWORKS_TAB_KEY].value.filter(network => !network.templateNetwork);

  const rows = [...withoutDiscardedTemplateNetworks];
  if (!rows.find(row => row.rootNetwork)) {
    rows.push(podNetwork);
  }

  if (newUserTemplate) {
    const templateInterfaces = getTemplateInterfaces(newUserTemplate);
    const networks = templateInterfaces.map(i => ({
      templateNetwork: i,
    }));

    // do not add root interface if there already is one or autoAttachPodInterface is set to false
    if (networks.some(network => network.templateNetwork.network.pod) || !hasAutoAttachPodInterface(newUserTemplate)) {
      const index = findIndex(rows, network => network.rootNetwork);
      rows.splice(index, 1);
    }

    rows.push(...networks);
  }

  return {
    ...stepData,
    [NETWORKS_TAB_KEY]: {
      ...stepData[NETWORKS_TAB_KEY],
      value: rows,
    },
  };
};

const rootDisk = {
  rootStorage: {},
  name: 'rootdisk',
  isBootable: true,
};

export const rootContainerDisk = {
  ...rootDisk,
  storageType: STORAGE_TYPE_CONTAINER,
};

export const rootDataVolumeDisk = {
  ...rootDisk,
  storageType: STORAGE_TYPE_DATAVOLUME,
  size: 10,
};

const onImageSourceTypeChangedInStorageTab = stepData => {
  const withoutRootStorage = stepData[STORAGE_TAB_KEY].value.filter(storage => !storage.rootStorage);
  const rows = [...withoutRootStorage];
  const basicSettings = stepData[BASIC_SETTINGS_TAB_KEY].value;
  if (!(basicSettings[USER_TEMPLATE_KEY] && basicSettings[USER_TEMPLATE_KEY].value)) {
    let storage;
    const provisionSource = basicSettings[PROVISION_SOURCE_TYPE_KEY].value;
    switch (provisionSource) {
      case PROVISION_SOURCE_URL:
        storage = rootDataVolumeDisk;
        break;
      case PROVISION_SOURCE_CONTAINER:
        storage = rootContainerDisk;
        break;
      case PROVISION_SOURCE_PXE:
        break;
      default:
        // eslint-disable-next-line
        console.warn(`Unknown provision source ${provisionSource}`);
        break;
    }
    if (storage) {
      rows.push(storage);
    }
  }
  return {
    ...stepData,
    [STORAGE_TAB_KEY]: {
      ...stepData[STORAGE_TAB_KEY],
      value: rows,
    },
  };
};

const onUserTemplateChanged = (props, stepData) => {
  const userTemplateName = getBasicSettingsValue(stepData, USER_TEMPLATE_KEY);
  const userTemplate = userTemplateName ? getUserTemplate(props.templates, userTemplateName) : undefined;
  const newStepData = onUserTemplateChangedInStorageTab(stepData, userTemplate);
  return onUserTemplateChangedInNetworksTab(newStepData, userTemplate);
};

const onImageSourceTypeChanged = (props, stepData) => onImageSourceTypeChangedInStorageTab(stepData);

const podNetwork = {
  rootNetwork: {},
  id: 0,
  name: 'eth0',
  mac: '',
  network: POD_NETWORK,
  editable: true,
  edit: false,
  networkType: NETWORK_TYPE_POD,
};

export class CreateVmWizard extends React.Component {
  state = {
    activeStepIndex: 0,
    stepData: {
      [BASIC_SETTINGS_TAB_KEY]: {
        // Basic Settings
        value: {},
        valid: false,
      },
      [NETWORKS_TAB_KEY]: {
        value: [podNetwork],
        valid: true,
      },
      [STORAGE_TAB_KEY]: {
        value: [], // Storages
        valid: true, // empty Storages are valid
      },
      [RESULT_TAB_KEY]: {
        value: '',
        valid: null, // result of the request
      },
    },
  };

  getLastStepIndex = () => this.wizardStepsNewVM.length - 1;

  lastStepReached = () => this.state.activeStepIndex === this.getLastStepIndex();

  callbacks = [
    {
      field: USER_TEMPLATE_KEY,
      callback: onUserTemplateChanged,
    },
    {
      field: PROVISION_SOURCE_TYPE_KEY,
      callback: onImageSourceTypeChanged,
    },
  ];

  onStepDataChanged = (key, value, valid) => {
    this.setState((state, props) => {
      let stepData = { ...state.stepData };

      stepData[key] = {
        value,
        valid,
      };

      if (key === BASIC_SETTINGS_TAB_KEY) {
        this.callbacks.forEach(callback => {
          const oldValue = getBasicSettingsValue(state.stepData, callback.field);
          const newValue = getBasicSettingsValue(stepData, callback.field);
          if (oldValue !== newValue) {
            stepData = callback.callback(props, stepData);
          }
        });
      }

      return { stepData };
    });
  };

  finish() {
    const create = this.props.createTemplate
      ? createVmTemplate
      : (k8sCreate, templates, basicSettings, networks, storage) =>
          createVm(k8sCreate, templates, basicSettings, networks, storage, this.props.persistentVolumeClaims);
    create(
      this.props.k8sCreate,
      this.props.templates,
      this.state.stepData[BASIC_SETTINGS_TAB_KEY].value,
      this.state.stepData[NETWORKS_TAB_KEY].value,
      this.state.stepData[STORAGE_TAB_KEY].value
    )
      .then(results => {
        const vmResult = results[results.length - 1];
        return this.onStepDataChanged(RESULT_TAB_KEY, JSON.stringify(vmResult, null, 1), true);
      })
      .catch(error => this.onStepDataChanged(RESULT_TAB_KEY, error.message, false));
  }

  onStepChanged = newActiveStepIndex => {
    if (
      !this.lastStepReached() && // do not allow going back once last step is reached
      (newActiveStepIndex < this.state.activeStepIndex || // allow going back to past steps
        this.state.stepData[this.wizardStepsNewVM[newActiveStepIndex - 1].key].valid)
    ) {
      if (newActiveStepIndex === this.getLastStepIndex()) {
        this.finish();
      }
      this.setState({ activeStepIndex: newActiveStepIndex });
    }
  };

  wizardStepsNewVM = [
    {
      title: STEP_BASIC_SETTINGS,
      key: BASIC_SETTINGS_TAB_KEY,
      render: () => {
        const loadingData = {
          namespaces: this.props.namespaces,
          templates: this.props.templates,
        };
        return (
          <LoadingBasicWizardTab
            key="1"
            selectedNamespace={this.props.selectedNamespace}
            basicSettings={this.state.stepData[BASIC_SETTINGS_TAB_KEY].value}
            onChange={(value, valid) => this.onStepDataChanged(BASIC_SETTINGS_TAB_KEY, value, valid)}
            loadingData={loadingData}
            createTemplate={this.props.createTemplate}
          />
        );
      },
    },
    {
      title: STEP_NETWORK,
      key: NETWORKS_TAB_KEY,
      render: () => {
        const loadingData = {
          networkConfigs: this.props.networkConfigs,
        };
        const sourceType = getBasicSettingsValue(this.state.stepData, PROVISION_SOURCE_TYPE_KEY);
        return (
          <LoadingNetworksTab
            onChange={(value, valid) => this.onStepDataChanged(NETWORKS_TAB_KEY, value, valid)}
            networkConfigs={this.props.networkConfigs}
            networks={this.state.stepData[NETWORKS_TAB_KEY].value || []}
            sourceType={sourceType}
            namespace={this.state.stepData[BASIC_SETTINGS_TAB_KEY].value.namespace.value}
            loadingData={loadingData}
          />
        );
      },
    },
    {
      title: STEP_STORAGE,
      key: STORAGE_TAB_KEY,
      render: () => {
        const loadingData = {
          storageClasses: this.props.storageClasses,
          persistentVolumeClaims: this.props.persistentVolumeClaims,
        };
        const sourceType = getBasicSettingsValue(this.state.stepData, PROVISION_SOURCE_TYPE_KEY);
        return (
          <LoadingStorageTab
            initialStorages={this.state.stepData[STORAGE_TAB_KEY].value}
            onChange={(value, valid) => this.onStepDataChanged(STORAGE_TAB_KEY, value, valid)}
            units={this.props.units}
            sourceType={sourceType}
            namespace={this.state.stepData[BASIC_SETTINGS_TAB_KEY].value.namespace.value}
            loadingData={loadingData}
          />
        );
      },
    },
    {
      title: STEP_RESULT,
      key: RESULT_TAB_KEY,
      render: () => {
        const stepData = this.state.stepData[RESULT_TAB_KEY];
        return (
          <ResultTab result={stepData.value} success={stepData.valid} createTemplate={this.props.createTemplate} />
        );
      },
    },
  ];

  render() {
    const beforeLastStepReached = this.state.activeStepIndex === this.wizardStepsNewVM.length - 2;
    const lastStepReached = this.lastStepReached();

    const createVmText = this.props.createTemplate ? CREATE_VM_TEMPLATE : CREATE_VM;

    return (
      <Wizard.Pattern
        show
        onHide={this.props.onHide}
        steps={this.wizardStepsNewVM}
        activeStepIndex={this.state.activeStepIndex}
        onStepChanged={index => this.onStepChanged(index)}
        previousStepDisabled={lastStepReached}
        cancelButtonDisabled={lastStepReached}
        stepButtonsDisabled={lastStepReached}
        nextStepDisabled={!this.state.stepData[this.wizardStepsNewVM[this.state.activeStepIndex].key].valid}
        nextText={beforeLastStepReached ? createVmText : NEXT}
        title={createVmText}
      />
    );
  }
}

CreateVmWizard.defaultProps = {
  selectedNamespace: undefined,
  templates: undefined,
  namespaces: undefined,
  networkConfigs: undefined,
  persistentVolumeClaims: undefined,
  storageClasses: undefined,
  createTemplate: false,
};

CreateVmWizard.propTypes = {
  onHide: PropTypes.func.isRequired,
  templates: PropTypes.array,
  namespaces: PropTypes.array,
  selectedNamespace: PropTypes.object,
  k8sCreate: PropTypes.func.isRequired,
  networkConfigs: PropTypes.array,
  persistentVolumeClaims: PropTypes.array,
  storageClasses: PropTypes.array,
  units: PropTypes.object.isRequired,
  createTemplate: PropTypes.bool,
};

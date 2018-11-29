import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';

import BasicSettingsTab from './BasicSettingsTab';
import StorageTab from './StorageTab';
import ResultTab from './ResultTab';

import { createVM } from '../../../k8s/request';
import { POD_NETWORK, PROVISION_SOURCE_PXE, PROVISION_SOURCE_TEMPLATE } from '../../../constants';
import { NetworksTab } from './NetworksTab';
import { isImageSourceType, settingsValue } from '../../../k8s/selectors';
import {
  IMAGE_SOURCE_TYPE_KEY,
  USER_TEMPLATE_KEY,
  IMAGE_URL_SIZE_KEY,
  BASIC_SETTINGS_TAB_KEY,
  NETWORKS_TAB_KEY,
  STORAGE_TAB_KEY,
  RESULT_TAB_KEY,
} from './constants';
import { CREATE_VM, STEP_BASIC_SETTINGS, STEP_NETWORK, STEP_STORAGE, STEP_RESULT, NEXT } from './strings';

import { getTemplateStorages } from './utils';
import { loadingWizardTab } from '../loadingWizardTab';
import { getUserTemplate } from '../../../utils/templates';

const LoadingBasicWizardTab = loadingWizardTab(BasicSettingsTab);
const LoadingStorageTab = loadingWizardTab(StorageTab);
const LoadingNetworksTab = loadingWizardTab(NetworksTab);

const getBasicSettingsValue = (stepData, key) => settingsValue(stepData[BASIC_SETTINGS_TAB_KEY].value, key);

const onUserTemplateChangedInStorageTab = (stepData, newUserTemplate) => {
  const withoutDiscardedTemplateStorage = stepData[STORAGE_TAB_KEY].value.filter(storage => !storage.templateStorage);

  const rows = [...withoutDiscardedTemplateStorage];

  if (newUserTemplate) {
    const templateStorages = getTemplateStorages(newUserTemplate);
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

const onUserTemplateChanged = (props, stepData) => {
  const userTemplateName = getBasicSettingsValue(stepData, USER_TEMPLATE_KEY);
  const userTemplate = userTemplateName ? getUserTemplate(props.templates, userTemplateName) : undefined;
  return onUserTemplateChangedInStorageTab(stepData, userTemplate);
};

const onImageSourceTypeChanged = (props, stepData) => {
  const userTemplateName =
    getBasicSettingsValue(stepData, IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_TEMPLATE
      ? getBasicSettingsValue(stepData, USER_TEMPLATE_KEY)
      : undefined;
  const userTemplate = userTemplateName ? getUserTemplate(props.templates, userTemplateName) : undefined;
  return onUserTemplateChangedInStorageTab(stepData, userTemplate);
};

export class CreateVmWizard extends React.Component {
  state = {
    activeStepIndex: 0,
    stepData: {
      [BASIC_SETTINGS_TAB_KEY]: {
        // Basic Settings
        value: {
          [IMAGE_URL_SIZE_KEY]: {
            value: 10,
          },
        },
        valid: false,
      },
      [NETWORKS_TAB_KEY]: {
        value: {
          networks: [
            {
              id: 1,
              name: 'eth0',
              mac: '',
              network: POD_NETWORK,
              editable: true,
              edit: false,
            },
          ],
        },
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
      field: IMAGE_SOURCE_TYPE_KEY,
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
    createVM(
      this.props.k8sCreate,
      this.props.templates,
      this.state.stepData[BASIC_SETTINGS_TAB_KEY].value,
      this.state.stepData[NETWORKS_TAB_KEY].value,
      this.state.stepData[STORAGE_TAB_KEY].value
    )
      .then(result => this.onStepDataChanged(RESULT_TAB_KEY, JSON.stringify(result, null, 1), true))
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
        return (
          <LoadingNetworksTab
            onChange={(value, valid) => this.onStepDataChanged(NETWORKS_TAB_KEY, value, valid)}
            networkConfigs={this.props.networkConfigs}
            networks={this.state.stepData[NETWORKS_TAB_KEY].value.networks || []}
            pxeBoot={isImageSourceType(this.state.stepData[BASIC_SETTINGS_TAB_KEY].value, PROVISION_SOURCE_PXE)}
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
        const sourceType = getBasicSettingsValue(this.state.stepData, IMAGE_SOURCE_TYPE_KEY);
        const loadingData = {
          storageClasses: this.props.storageClasses,
          persistentVolumeClaims: this.props.persistentVolumeClaims,
        };
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
        return <ResultTab result={stepData.value} success={stepData.valid} />;
      },
    },
  ];

  render() {
    const beforeLastStepReached = this.state.activeStepIndex === this.wizardStepsNewVM.length - 2;
    const lastStepReached = this.lastStepReached();

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
        nextText={beforeLastStepReached ? CREATE_VM : NEXT}
        title={CREATE_VM}
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
};

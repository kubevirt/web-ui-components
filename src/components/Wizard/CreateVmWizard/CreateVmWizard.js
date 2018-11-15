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
  BASIC_SETTINGS_TAB_IDX,
  NETWORK_TAB_IDX,
  STORAGE_TAB_IDX,
  IMAGE_SOURCE_TYPE_KEY,
  RESULTS_TAB_IDX,
  NAMESPACE_KEY,
  USER_TEMPLATE_KEY,
  IMAGE_URL_SIZE_KEY,
} from './constants';
import { CREATE_VM, STEP_BASIC_SETTINGS, STEP_NETWORK, STEP_STORAGE, STEP_RESULT, NEXT } from './strings';

import { getTemplateStorages } from './utils';
import { loadingWizardTab } from '../loadingWizardTab';

const LoadingBasicWizardTab = loadingWizardTab(BasicSettingsTab);
const LoadingStorageTab = loadingWizardTab(StorageTab);
const LoadingNetworksTab = loadingWizardTab(NetworksTab);

const getBasicSettingsValue = (stepData, key) => settingsValue(stepData[BASIC_SETTINGS_TAB_IDX].value, key);

const onUserTemplateChangedInStorageTab = ({ templates }, stepData, newUserTemplate) => {
  const withoutDiscardedTemplateStorage = stepData.value.filter(storage => !storage.templateStorage);

  const rows = [...withoutDiscardedTemplateStorage];

  if (newUserTemplate) {
    const templateStorages = getTemplateStorages(templates, newUserTemplate);
    rows.push(...templateStorages);
  }

  return {
    ...stepData,
    value: rows,
  };
};

const onUserTemplateChanged = (props, stepData, stepIdx, basicSettings) => {
  let userTemplate;
  switch (stepIdx) {
    case STORAGE_TAB_IDX:
      userTemplate = settingsValue(basicSettings, USER_TEMPLATE_KEY);
      return onUserTemplateChangedInStorageTab(props, stepData, userTemplate);
    default:
      return stepData;
  }
};

const onImageSourceTypeChanged = (props, stepData, stepIdx, basicSettings) => {
  let userTemplate;
  switch (stepIdx) {
    case STORAGE_TAB_IDX:
      userTemplate =
        settingsValue(basicSettings, IMAGE_SOURCE_TYPE_KEY) === PROVISION_SOURCE_TEMPLATE
          ? settingsValue(basicSettings, USER_TEMPLATE_KEY)
          : undefined;
      return onUserTemplateChangedInStorageTab(props, stepData, userTemplate);
    default:
      return stepData;
  }
};

const onNamespaceChanged = (props, stepData, stepIdx) => {
  switch (stepIdx) {
    case STORAGE_TAB_IDX:
      if (stepData.value.length > 0) {
        return {
          ...stepData,
          // cannot asses validity when namespace changes (if disks present)
          valid: false,
        };
      }
      return stepData;
    default:
      return stepData;
  }
};

export class CreateVmWizard extends React.Component {
  state = {
    activeStepIndex: BASIC_SETTINGS_TAB_IDX,
    stepData: [
      {
        // Basic Settings
        value: {
          [IMAGE_URL_SIZE_KEY]: {
            value: 10,
          },
        },
        valid: false,
      },
      {
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
      {
        value: [], // Storages
        valid: true, // empty Storages are valid
      },
      {
        value: '',
        valid: null, // result of the request
      },
    ],
  };

  getLastStepIndex = () => this.state.stepData.length - 1;

  lastStepReached = () => this.state.activeStepIndex === this.getLastStepIndex();

  onStepDataChanged = (value, valid) => {
    this.setState((state, props) => {
      const oldStepData = state.stepData;
      let stepData = [...oldStepData];

      stepData[state.activeStepIndex] = {
        value,
        valid,
      };

      if (state.activeStepIndex === BASIC_SETTINGS_TAB_IDX) {
        // callbacks for changes on fields resolve new step data
        stepData = [
          {
            field: NAMESPACE_KEY,
            callback: onNamespaceChanged,
          },
          {
            field: USER_TEMPLATE_KEY,
            callback: onUserTemplateChanged,
          },
          {
            field: IMAGE_SOURCE_TYPE_KEY,
            callback: onImageSourceTypeChanged,
          },
        ].reduce((newStepData, { field, callback }) => {
          const oldValue = getBasicSettingsValue(oldStepData, field);
          const newValue = getBasicSettingsValue(newStepData, field);

          if (oldValue === newValue) {
            return newStepData;
          }
          return newStepData.map((v, idx) => callback(props, v, idx, newStepData[BASIC_SETTINGS_TAB_IDX].value));
        }, stepData);
      }

      return { stepData };
    });
  };

  finish() {
    const stepValuesWithoutResult = this.state.stepData
      .filter((value, idx) => idx !== RESULTS_TAB_IDX)
      .map(stepData => stepData.value);

    createVM(this.props.k8sCreate, this.props.templates, ...stepValuesWithoutResult)
      .then(result => this.onStepDataChanged(JSON.stringify(result, null, 1), true))
      .catch(error => this.onStepDataChanged(error.message, false));
  }

  onStepChanged = newActiveStepIndex => {
    if (
      !this.lastStepReached() && // do not allow going back once last step is reached
      (newActiveStepIndex < this.state.activeStepIndex || // allow going back to past steps
        this.state.stepData.slice(0, newActiveStepIndex).reduce((validity, item) => validity && item.valid, true))
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
      render: () => {
        const loadingData = {
          namespaces: this.props.namespaces,
          templates: this.props.templates,
        };
        return (
          <LoadingBasicWizardTab
            key="1"
            selectedNamespace={this.props.selectedNamespace}
            basicSettings={this.state.stepData[BASIC_SETTINGS_TAB_IDX].value}
            onChange={this.onStepDataChanged}
            loadingData={loadingData}
          />
        );
      },
    },
    {
      title: STEP_NETWORK,
      render: () => {
        const loadingData = {
          networkConfigs: this.props.networkConfigs,
        };
        return (
          <LoadingNetworksTab
            onChange={this.onStepDataChanged}
            networkConfigs={this.props.networkConfigs}
            networks={this.state.stepData[NETWORK_TAB_IDX].value.networks || []}
            pxeBoot={isImageSourceType(this.state.stepData[BASIC_SETTINGS_TAB_IDX].value, PROVISION_SOURCE_PXE)}
            namespace={this.state.stepData[0].value.namespace.value}
            loadingData={loadingData}
          />
        );
      },
    },
    {
      title: STEP_STORAGE,
      render: () => {
        const sourceType = getBasicSettingsValue(this.state.stepData, IMAGE_SOURCE_TYPE_KEY);
        const loadingData = {
          storageClasses: this.props.storageClasses,
          persistentVolumeClaims: this.props.persistentVolumeClaims,
        };
        return (
          <LoadingStorageTab
            initialStorages={this.state.stepData[STORAGE_TAB_IDX].value}
            onChange={this.onStepDataChanged}
            units={this.props.units}
            sourceType={sourceType}
            namespace={this.state.stepData[0].value.namespace.value}
            loadingData={loadingData}
          />
        );
      },
    },
    {
      title: STEP_RESULT,
      render: () => {
        const stepData = this.state.stepData[RESULTS_TAB_IDX];
        return <ResultTab result={stepData.value} success={stepData.valid} />;
      },
    },
  ];

  render() {
    const beforeLastStepReached = this.state.activeStepIndex === this.state.stepData.length - 2;
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
        nextStepDisabled={!this.state.stepData[this.state.activeStepIndex].valid}
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

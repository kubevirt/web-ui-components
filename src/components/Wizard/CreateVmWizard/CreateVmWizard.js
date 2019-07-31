import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';

import { VmSettingsTab } from './VmSettingsTab';
import { getInitialActiveStepIndex, getTabInitialState } from './initialState';

import { validateTabData } from './validations';
import { StorageTab } from './StorageTab';
import { ResultTab } from './ResultTab';
import { ResultTabRow } from './ResultTabRow';
import { NetworksTab } from './NetworksTab';
import { LoadingTab } from '../LoadingTab';
import { createVm, createVmTemplate } from '../../../k8s/request';

import {
  VM_SETTINGS_TAB_KEY,
  NAMESPACE_KEY,
  NETWORKS_TAB_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  RESULT_TAB_KEY,
  STORAGE_TAB_KEY,
} from './constants';

import {
  CREATE_VM,
  CREATE_VM_TEMPLATE,
  NEXT,
  STEP_BASIC_SETTINGS,
  STEP_NETWORK,
  STEP_RESULT,
  STEP_STORAGE,
} from './strings';

import { EnhancedK8sMethods } from '../../../k8s/util/enhancedK8sMethods';
import { getUpdatedState } from './stateUpdate/stateUpdate';
import { cleanupAndGetResults, errorsFirstSort, getResults } from '../../../k8s/util/k8sMethodsUtils';
import { VMWareImportProvider } from './providers/VMwareImportProvider/VMWareImportProvider';
import { ImportProvider } from './providers/ImportProvider/ImportProvider';
import { isVmwareProvider } from './providers/VMwareImportProvider/selectors';
import { getVmWareProviderRequestedResources } from './providers/VMwareImportProvider/requestedResources';
import { getVmSettings, getVmSettingValue, onCloseVmSettings } from './utils/vmSettingsTabUtils';

const ALL_TAB_KEYS = [VM_SETTINGS_TAB_KEY, NETWORKS_TAB_KEY, STORAGE_TAB_KEY, RESULT_TAB_KEY];

const getUpdatedValidatedState = (prevProps, prevState, props, state, extra) => {
  const newState = ALL_TAB_KEYS.reduce(
    (intermediaryState, tabKey) =>
      getUpdatedState(tabKey, prevProps, prevState, props, intermediaryState, extra) || intermediaryState,
    state
  );

  if (state === newState) {
    return state; // skip validation
  }

  const validatedStepData = ALL_TAB_KEYS.reduce((resultStepData, tabKey) => {
    const { value, valid } = newState.stepData[tabKey];
    resultStepData[tabKey] = validateTabData(tabKey, value, valid, props);
    return resultStepData;
  }, {});

  return {
    ...newState,
    stepData: validatedStepData,
  };
};

export class CreateVmWizard extends React.Component {
  constructor(props) {
    super(props);

    const initialState = ALL_TAB_KEYS.reduce(
      (state, tabKey) => {
        state.stepData[tabKey] = getTabInitialState(tabKey, props);
        return state;
      },
      {
        activeStepIndex: getInitialActiveStepIndex(),
        stepData: {},
      }
    );

    this.state = getUpdatedValidatedState(null, null, props, initialState, {
      // eslint-disable-next-line no-console
      safeSetState: () => console.warn('setState not supported when initializing'),
      virtualMachines: this.props.virtualMachines,
    });
  }

  componentDidMount() {
    this._unmounted = false;
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  safeSetState = state => {
    if (!this._unmounted) {
      this.setState(state);
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const newState = getUpdatedValidatedState(prevProps, prevState, this.props, this.state, {
      safeSetState: this.safeSetState,
      virtualMachines: this.props.virtualMachines,
    });

    if (this.state !== newState) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.safeSetState(newState);
    }
  }

  getLastStepIndex = () => this.wizardStepsNewVM.length - 1;

  lastStepReached = () => this.state.activeStepIndex === this.getLastStepIndex();

  onStepDataChanged = (tabKey, value, valid, lockStep = false) => {
    const validatedTabData = validateTabData(tabKey, value, valid, this.props);
    this.safeSetState(state => ({
      stepData: {
        ...state.stepData,
        [tabKey]: {
          ...validatedTabData,
          lockStep,
        },
      },
    }));
  };

  finish() {
    const create = this.props.createTemplate ? createVmTemplate : createVm;

    const vmSettings = this.state.stepData[VM_SETTINGS_TAB_KEY].value;

    const enhancedK8sMethods = new EnhancedK8sMethods(this.props);

    create(
      enhancedK8sMethods,
      this.props.templates,
      vmSettings,
      this.state.stepData[NETWORKS_TAB_KEY].value,
      this.state.stepData[STORAGE_TAB_KEY].value,
      this.props.persistentVolumeClaims,
      this.props.storageClassConfigMap,
      this.props.units
    )
      .then(() => getResults(enhancedK8sMethods))
      .catch(error => cleanupAndGetResults(enhancedK8sMethods, error))
      .then(({ results, valid }) => this.onStepDataChanged(RESULT_TAB_KEY, errorsFirstSort(results), valid))
      // eslint-disable-next-line no-console
      .catch(e => console.error(e));
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
      this.safeSetState({ activeStepIndex: newActiveStepIndex });
    }
  };

  onHideWrapper = (...eventArgs) => {
    this.wizardStepsNewVM.forEach(step => {
      if (step.onCloseWizard) {
        const callerContext = {
          k8sKill: this.props.k8sKill,
        };
        step.onCloseWizard(this.state.stepData[step.key].value, callerContext);
      }
    });

    if (this.props.onHide) {
      this.props.onHide(...eventArgs);
    }
  };

  wizardStepsNewVM = [
    {
      title: STEP_BASIC_SETTINGS,
      key: VM_SETTINGS_TAB_KEY,
      onCloseWizard: onCloseVmSettings,
      render: () => {
        const { namespaces, templates, dataVolumes, virtualMachines, Firehose, isV2vVmwareCrd } = this.props;

        const loadingData = { namespaces, templates, dataVolumes, virtualMachines };
        const vmSettings = getVmSettings(this.state);

        const vmwareImportResources = getVmWareProviderRequestedResources(this.state);
        return (
          <LoadingTab {...loadingData}>
            <VmSettingsTab
              key={VM_SETTINGS_TAB_KEY}
              vmSettings={vmSettings}
              onChange={(value, valid) => this.onStepDataChanged(VM_SETTINGS_TAB_KEY, value, valid)}
              {...loadingData}
              isV2vVmwareCrd={isV2vVmwareCrd}
            >
              <ImportProvider isVisible={isVmwareProvider(this.state)}>
                <Firehose resources={vmwareImportResources}>
                  <VMWareImportProvider
                    vmSettings={vmSettings}
                    onChange={(value, valid) => this.onStepDataChanged(VM_SETTINGS_TAB_KEY, value, valid)}
                    k8sPatch={this.props.k8sPatch}
                  />
                </Firehose>
              </ImportProvider>
            </VmSettingsTab>
          </LoadingTab>
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
        const sourceType = getVmSettingValue(this.state, PROVISION_SOURCE_TYPE_KEY);
        return (
          <LoadingTab {...loadingData}>
            <NetworksTab
              key={NETWORKS_TAB_KEY}
              onChange={(value, valid, lockStep) => this.onStepDataChanged(NETWORKS_TAB_KEY, value, valid, lockStep)}
              networkConfigs={this.props.networkConfigs}
              networks={this.state.stepData[NETWORKS_TAB_KEY].value || []}
              sourceType={sourceType}
              namespace={getVmSettingValue(this.state, NAMESPACE_KEY)}
              isCreateRemoveDisabled={isVmwareProvider(this.state)}
              {...loadingData}
            />
          </LoadingTab>
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
        const sourceType = getVmSettingValue(this.state, PROVISION_SOURCE_TYPE_KEY);
        return (
          <LoadingTab {...loadingData}>
            <StorageTab
              key={STORAGE_TAB_KEY}
              initialStorages={this.state.stepData[STORAGE_TAB_KEY].value}
              onChange={(value, valid, lockStep) => this.onStepDataChanged(STORAGE_TAB_KEY, value, valid, lockStep)}
              units={this.props.units}
              sourceType={sourceType}
              namespace={getVmSettingValue(this.state, NAMESPACE_KEY)}
              isCreateRemoveDisabled={isVmwareProvider(this.state)}
              {...loadingData}
            />
          </LoadingTab>
        );
      },
    },
    {
      title: STEP_RESULT,
      key: RESULT_TAB_KEY,
      render: () => {
        const stepData = this.state.stepData[RESULT_TAB_KEY];
        return (
          <ResultTab key={RESULT_TAB_KEY} isSuccessful={stepData.valid} isCreateTemplate={this.props.createTemplate}>
            {stepData.value.map((result, index) => (
              <ResultTabRow key={index} {...result} />
            ))}
          </ResultTab>
        );
      },
    },
  ];

  render() {
    const beforeLastStepReached = this.state.activeStepIndex === this.wizardStepsNewVM.length - 2;
    const lastStepReached = this.lastStepReached();

    const createVmText = this.props.createTemplate ? CREATE_VM_TEMPLATE : CREATE_VM;
    const currentStepData = this.state.stepData[this.wizardStepsNewVM[this.state.activeStepIndex].key];

    return (
      <Wizard.Pattern
        show
        backdrop="static"
        onHide={this.onHideWrapper}
        steps={this.wizardStepsNewVM}
        activeStepIndex={this.state.activeStepIndex}
        onStepChanged={this.onStepChanged}
        previousStepDisabled={currentStepData.lockStep ? true : lastStepReached}
        cancelButtonDisabled={lastStepReached}
        stepButtonsDisabled={lastStepReached}
        nextStepDisabled={currentStepData.lockStep ? true : !currentStepData.valid}
        nextText={beforeLastStepReached ? createVmText : NEXT}
        title={createVmText}
        dialogClassName="modal-lg wizard-pf kubevirt-wizard kubevirt-create-vm-wizard"
      />
    );
  }
}

CreateVmWizard.defaultProps = {
  templatesLoaded: false,
  templates: null,
  namespaces: null,
  virtualMachines: null,
  selectedNamespace: null,
  networkConfigs: null,
  persistentVolumeClaims: null,
  storageClassConfigMap: null,
  storageClasses: null,
  createTemplate: false,
  dataVolumes: null,
  isV2vVmwareCrd: false,
};

CreateVmWizard.propTypes = {
  Firehose: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired, // Firehose can be wrapped by react.memo within caller-context
  k8sCreate: PropTypes.func.isRequired,
  k8sGet: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  k8sKill: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  templatesLoaded: PropTypes.bool,
  templates: PropTypes.array,
  namespaces: PropTypes.array,
  virtualMachines: PropTypes.array,
  selectedNamespace: PropTypes.object,
  networkConfigs: PropTypes.array,
  persistentVolumeClaims: PropTypes.array,
  storageClassConfigMap: PropTypes.object,
  storageClasses: PropTypes.array,
  units: PropTypes.object.isRequired,
  createTemplate: PropTypes.bool,
  dataVolumes: PropTypes.array,
  isV2vVmwareCrd: PropTypes.bool,
};

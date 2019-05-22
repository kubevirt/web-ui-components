/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';
import { connect } from 'react-redux';

import { ConnectedVmSettingsTab } from './VmSettingsTab';

import { ConnectedStorageTab } from './StorageTab';
import { ResultTab } from './ResultTab';
import { ResultTabRow } from './ResultTabRow';
import { ConnectedNetworksTab } from './NetworksTab';
import { LoadingTab } from '../LoadingTab';
import { createVm, createVmTemplate } from '../../../k8s/request';

import { NAMESPACE_KEY, NETWORKS_TAB_KEY, RESULT_TAB_KEY, STORAGE_TAB_KEY, VM_SETTINGS_TAB_KEY } from './constants';

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
import { cleanupAndGetResults, errorsFirstSort, getResults } from '../../../k8s/util/k8sMethodsUtils';
import { getVmwareField, isVmwareProvider } from './providers/VMwareImportProvider/selectors';
import { getVmSettingValue } from './utils/vmSettingsTabUtils';
import { withReduxId } from '../../../utils/redux';
import { DETECT_PROP_CHANGES, types, vmWizardActions } from './redux/actions';
import { ImportProvider } from './providers/ImportProvider/ImportProvider';
import { ConnectedVMWareImportProvider } from './providers/VMwareImportProvider/VMWareImportProvider';
import { getVmWareProviderRequestedResources } from './providers/VMwareImportProvider/requestedResources';
import { PROVIDER_VMWARE_V2V_NAME_KEY } from './providers/VMwareImportProvider/constants';
import { get } from '../../../selectors';
import { immutableListToShallowJS, concatImmutableLists } from '../../../utils/immutable';

export class CreateVmWizardComponent extends React.Component {
  constructor(props) {
    super(props);
    props.onInitialize();

    this.state = {
      activeStepIndex: 0,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let somePropChanged = false;
    const changedProps = DETECT_PROP_CHANGES.reduce((changedPropsAcc, propName) => {
      const propChanged = prevProps[propName] !== this.props[propName];

      changedPropsAcc[propName] = propChanged;

      somePropChanged = somePropChanged || propChanged;
      return changedPropsAcc;
    }, {});

    if (somePropChanged) {
      this.props.onPropsDataChanged(this.props, changedProps);
    }
  }

  getLastStepIndex = () => this.wizardStepsNewVM.length - 1;

  lastStepReached = () => this.state.activeStepIndex === this.getLastStepIndex();

  isStepValid = stepIndex => get(this.props.data.stepData, [this.wizardStepsNewVM[stepIndex].key, 'valid']);

  isStepLocked = stepIndex => get(this.props.data.stepData, [this.wizardStepsNewVM[stepIndex].key, 'locked']);

  finish() {
    const create = this.props.createTemplate ? createVmTemplate : createVm;
    const enhancedK8sMethods = new EnhancedK8sMethods(this.props);

    create({
      enhancedK8sMethods,
      templates: immutableListToShallowJS(concatImmutableLists(this.props.userTemplates, this.props.commonTemplates)),
      vmSettings: get(this.props.data.stepData, [VM_SETTINGS_TAB_KEY, 'value']).toJS(),
      networks: get(this.props.data.stepData, [NETWORKS_TAB_KEY, 'value']).toJS(),
      storages: get(this.props.data.stepData, [STORAGE_TAB_KEY, 'value']).toJS(),
      persistentVolumeClaims: immutableListToShallowJS(this.props.persistentVolumeClaims),
      units: this.props.units,
    })
      .then(() => getResults(enhancedK8sMethods))
      .catch(error => cleanupAndGetResults(enhancedK8sMethods, error))
      .then(({ results, valid }) => this.props.onResultsChanged(errorsFirstSort(results), valid))
      // eslint-disable-next-line no-console
      .catch(e => console.error(e));
  }

  onStepChanged = newActiveStepIndex => {
    if (
      !this.lastStepReached() && // do not allow going back once last step is reached
      (newActiveStepIndex < this.state.activeStepIndex || // allow going back to past steps
        this.isStepValid(newActiveStepIndex - 1))
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
      key: VM_SETTINGS_TAB_KEY,
      render: () => {
        const {
          namespaces,
          selectedNamespace,
          userTemplates,
          commonTemplates,
          virtualMachines,
          dataVolumes,
          WithResources,
        } = this.props;
        const loadingData = { namespaces, userTemplates, commonTemplates, dataVolumes, virtualMachines };

        const commonProps = {
          dataVolumes,
          userTemplates,
          commonTemplates,
          virtualMachines,
          selectedNamespace,
          k8sCreate: this.props.k8sCreate,
          k8sGet: this.props.k8sGet,
          k8sPatch: this.props.k8sPatch,
          k8sKill: this.props.k8sKill,
        };
        return (
          <LoadingTab {...loadingData} key={VM_SETTINGS_TAB_KEY}>
            <ConnectedVmSettingsTab
              key={VM_SETTINGS_TAB_KEY}
              wizardReduxId={this.props.reduxId}
              {...loadingData}
              userTemplates={userTemplates}
              dispatchUpdateContext={commonProps}
            >
              <ImportProvider key="vmware" isVisible={this.props.data.isVmwareProvider}>
                <WithResources
                  resourceMap={getVmWareProviderRequestedResources({
                    namespace: this.props.data.activeNamespace,
                    v2vVmwareName: this.props.data.v2vVmwareName,
                  })}
                >
                  <ConnectedVMWareImportProvider
                    wizardReduxId={this.props.reduxId}
                    dispatchUpdateContext={commonProps}
                  />
                </WithResources>
              </ImportProvider>
            </ConnectedVmSettingsTab>
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
        return (
          <LoadingTab {...loadingData} key={NETWORKS_TAB_KEY}>
            <ConnectedNetworksTab
              networkConfigs={this.props.networkConfigs}
              wizardReduxId={this.props.reduxId}
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
        return (
          <LoadingTab {...loadingData} key={STORAGE_TAB_KEY}>
            <ConnectedStorageTab units={this.props.units} wizardReduxId={this.props.reduxId} {...loadingData} />
          </LoadingTab>
        );
      },
    },
    {
      title: STEP_RESULT,
      key: RESULT_TAB_KEY,
      render: () => {
        const stepData = get(this.props.data.stepData, RESULT_TAB_KEY).toJS();
        return (
          <ResultTab key={RESULT_TAB_KEY} isSuccessful={stepData.valid} isCreateTemplate={this.props.createTemplate}>
            {stepData.value.map((result, index) => (
              <ResultTabRow key={index} wizardReduxId={this.props.reduxId} {...result} />
            ))}
          </ResultTab>
        );
      },
    },
  ];

  render() {
    const { activeStepIndex } = this.state;
    const { createTemplate, data } = this.props;

    const beforeLastStepReached = activeStepIndex === this.wizardStepsNewVM.length - 2;
    const lastStepReached = this.lastStepReached();
    const isStepLocked = this.isStepLocked(activeStepIndex);

    const createVmText = createTemplate ? CREATE_VM_TEMPLATE : CREATE_VM;

    if (!data.stepData) {
      console.warn(`invalid redux ID (${this.props.reduxId}). Wizard is closed!`);
      return null;
    }

    return (
      <Wizard.Pattern
        show
        backdrop="static"
        onHide={this.props.onHide}
        steps={this.wizardStepsNewVM}
        activeStepIndex={activeStepIndex}
        onStepChanged={this.onStepChanged}
        previousStepDisabled={isStepLocked || lastStepReached}
        cancelButtonDisabled={lastStepReached}
        stepButtonsDisabled={lastStepReached}
        nextStepDisabled={isStepLocked || !this.isStepValid(activeStepIndex)}
        nextText={beforeLastStepReached ? createVmText : NEXT}
        title={createVmText}
        dialogClassName="modal-lg wizard-pf kubevirt-wizard kubevirt-create-vm-wizard"
      />
    );
  }
}

CreateVmWizardComponent.defaultProps = {
  userTemplates: null,
  commonTemplates: null,
  namespaces: null,
  selectedNamespace: null,
  networkConfigs: null,
  persistentVolumeClaims: null,
  storageClasses: null,
  createTemplate: false,
  dataVolumes: null,
  virtualMachines: null,
};

CreateVmWizardComponent.propTypes = {
  WithResources: PropTypes.func.isRequired,
  k8sCreate: PropTypes.func.isRequired,
  k8sGet: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  k8sKill: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  units: PropTypes.object.isRequired,
  userTemplates: PropTypes.object,
  commonTemplates: PropTypes.object,
  namespaces: PropTypes.object,
  networkConfigs: PropTypes.object,
  persistentVolumeClaims: PropTypes.object,
  storageClasses: PropTypes.object,
  dataVolumes: PropTypes.object,
  virtualMachines: PropTypes.object,
  createTemplate: PropTypes.bool,
  selectedNamespace: PropTypes.object,
  // from connect
  reduxId: PropTypes.string.isRequired,
  onInitialize: PropTypes.func.isRequired,
  onPropsDataChanged: PropTypes.func.isRequired,
  onResultsChanged: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

const stateToProps = (state, { reduxId }) => ({
  data: {
    stepData: get(get(state, ['kubevirt', 'createVmWizards']), reduxId),
    activeNamespace: getVmSettingValue(state, reduxId, NAMESPACE_KEY),
    isVmwareProvider: isVmwareProvider(state, reduxId),
    v2vVmwareName: getVmwareField(state, reduxId, PROVIDER_VMWARE_V2V_NAME_KEY),
  },
});

const dispatchToProps = (dispatch, props) => ({
  onInitialize: () => {
    dispatch(vmWizardActions[types.create](props.reduxId, props));
  },
  onPropsDataChanged: (nextProps, changedProps) => {
    dispatch(vmWizardActions[types.propsDataChanged](props.reduxId, nextProps, changedProps));
  },
  onResultsChanged: (results, valid) => {
    dispatch(vmWizardActions[types.setResults](props.reduxId, results, valid));
  },
  onHide: (...args) => {
    if (props.onHide) {
      props.onHide(...args);
    }
    dispatch(vmWizardActions[types.dispose](props.reduxId, props));
  },
});

export const CreateVmWizard = withReduxId(
  connect(
    stateToProps,
    dispatchToProps
  )(CreateVmWizardComponent)
);

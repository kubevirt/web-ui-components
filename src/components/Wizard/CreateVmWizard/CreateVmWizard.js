import React from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import { Wizard } from 'patternfly-react';

import { BasicSettingsTab, onCloseBasic } from './BasicSettingsTab';
import { StorageTab, validateStorage } from './StorageTab';
import { ResultTab } from './ResultTab';
import { ResultTabRow } from './ResultTabRow';
import { NetworksTab } from './NetworksTab';
import { loadingWizardTab } from '../loadingWizardTab';
import { settingsValue } from '../../../k8s/selectors';
import { createVm, createVmTemplate } from '../../../k8s/request';

import {
  POD_NETWORK,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_CLONED_DISK,
} from '../../../constants';

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
  INTERMEDIARY_NETWORKS_TAB_KEY,
  NAMESPACE_KEY,
  PROVIDER_VMWARE_VM_KEY,
  INTERMEDIARY_STORAGE_TAB_KEY,
} from './constants';

import {
  CREATE_VM,
  CREATE_VM_TEMPLATE,
  STEP_BASIC_SETTINGS,
  STEP_NETWORK,
  STEP_STORAGE,
  STEP_RESULT,
  NEXT,
  ERROR,
  CREATED,
  NOT_CREATED,
} from './strings';

import {
  getUserTemplate,
  getTemplateStorages,
  getTemplateInterfaces,
  hasAutoAttachPodInterface,
} from '../../../utils/templates';

import { getName } from '../../../selectors';

// left intentionally empty
const TEMPLATE_ROOT_STORAGE = {};

const LoadingBasicWizardTab = loadingWizardTab(BasicSettingsTab);
const LoadingStorageTab = loadingWizardTab(StorageTab);
const LoadingNetworksTab = loadingWizardTab(NetworksTab);

const getBasicSettingsValue = (stepData, key) => settingsValue(stepData[BASIC_SETTINGS_TAB_KEY].value, key);

const getInitialDisk = provisionSource => {
  switch (provisionSource) {
    case PROVISION_SOURCE_URL:
      return rootDataVolumeDisk;
    case PROVISION_SOURCE_CONTAINER:
      return rootContainerDisk;
    case PROVISION_SOURCE_PXE:
    case PROVISION_SOURCE_CLONED_DISK:
    case PROVISION_SOURCE_IMPORT:
      return null;
    default:
      // eslint-disable-next-line
      console.warn(`Unknown provision source ${provisionSource}`);
      return null;
  }
};

const onUserTemplateChangedInStorageTab = (stepData, newUserTemplate, dataVolumes) => {
  const withoutDiscardedTemplateStorage = stepData[STORAGE_TAB_KEY].value.filter(
    storage => !(storage.templateStorage || storage.rootStorage)
  );

  const rows = [...withoutDiscardedTemplateStorage];

  if (newUserTemplate) {
    const templateStorages = getTemplateStorages(newUserTemplate, dataVolumes).map(storage => ({
      templateStorage: storage,
      rootStorage: storage.disk.bootOrder === 1 ? TEMPLATE_ROOT_STORAGE : undefined,
    }));
    rows.push(...templateStorages);
  } else {
    const basicSettings = stepData[BASIC_SETTINGS_TAB_KEY].value;
    const storage = getInitialDisk(settingsValue(basicSettings, PROVISION_SOURCE_TYPE_KEY));
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
  const filteredStorage = stepData[STORAGE_TAB_KEY].value.filter(
    storage => storage.templateStorage || !storage.rootStorage
  );
  const rows = [...filteredStorage];
  const basicSettings = stepData[BASIC_SETTINGS_TAB_KEY].value;
  if (!settingsValue(basicSettings, USER_TEMPLATE_KEY)) {
    const storage = getInitialDisk(settingsValue(basicSettings, PROVISION_SOURCE_TYPE_KEY));
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
  const newStepData = onUserTemplateChangedInStorageTab(stepData, userTemplate, props.dataVolumes);
  return onUserTemplateChangedInNetworksTab(newStepData, userTemplate);
};

const onImageSourceTypeChanged = (props, stepData) => onImageSourceTypeChangedInStorageTab(stepData);

export const onVmwareVmChanged = (props, stepData) => {
  const sourceNetworks = getBasicSettingsValue(stepData, INTERMEDIARY_NETWORKS_TAB_KEY);
  delete stepData[BASIC_SETTINGS_TAB_KEY].value[INTERMEDIARY_NETWORKS_TAB_KEY]; // not needed anymore, do not setState() that

  const sourceDisks = getBasicSettingsValue(stepData, INTERMEDIARY_STORAGE_TAB_KEY);
  delete stepData[BASIC_SETTINGS_TAB_KEY].value[INTERMEDIARY_STORAGE_TAB_KEY];

  if (sourceNetworks) {
    const rows = sourceNetworks.map((src, index) => ({
      rootNetwork: {},
      id: index,
      name: src.name,
      mac: src.mac,
      network: undefined, // Let the user select proper mapping
      networkType: undefined,
      editable: true,
      edit: false,
      importSourceId: src.id, // will be used for pairing when Conversion POD is executed
    }));

    stepData = {
      ...stepData,
      [NETWORKS_TAB_KEY]: {
        ...stepData[NETWORKS_TAB_KEY],
        value: rows,
      },
    };
  }

  if (sourceDisks) {
    const rows = sourceDisks.map((src, index) => {
      const row = {
        rootStorage: {},
        name: src.name,
        isBootable: false, // TODO
        storageType: STORAGE_TYPE_DATAVOLUME, // TODO: PVC should be enough but validation expects the PVC to be already created
        size: src.capacity / (1024 * 1024 * 1024), // bytes to GB
        storageClass: undefined, // Let the user select proper mapping

        id: index,
        editable: true,
        edit: false,
        importSourceId: src.id, // will be used for pairing when Conversion POD is executed
      };
      row.errors = validateStorage(row);
      return row;
    });

    stepData = {
      ...stepData,
      [STORAGE_TAB_KEY]: {
        ...stepData[STORAGE_TAB_KEY],
        value: rows,
        // the "valid" field will be set within StorageTab constructor processing based on the "row.error"
      },
    };
  }

  return stepData;
};

const podNetwork = {
  rootNetwork: {},
  id: 0,
  name: 'nic0',
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
        value: [],
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
    {
      field: INTERMEDIARY_NETWORKS_TAB_KEY, // can not use PROVIDER_VMWARE_VM_KEY to detect changes due to asynchronous load of details _after_ selection
      callback: onVmwareVmChanged,
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
    const create = this.props.createTemplate ? createVmTemplate : createVm;
    const k8sObjectToResult = (obj, jmessage) => ({
      content: obj,
      title: `${obj.kind} ${getName(obj)} ${jmessage}`,
    });

    create(
      this.props.k8sCreate,
      this.props.templates,
      this.state.stepData[BASIC_SETTINGS_TAB_KEY].value,
      this.state.stepData[NETWORKS_TAB_KEY].value,
      this.state.stepData[STORAGE_TAB_KEY].value,
      this.props.persistentVolumeClaims
    )
      .then(objects =>
        this.onStepDataChanged(RESULT_TAB_KEY, objects.map(object => k8sObjectToResult(object, CREATED)), true)
      )
      .catch(({ message, objects }) =>
        this.onStepDataChanged(
          RESULT_TAB_KEY,
          [
            {
              content: message,
              title: ERROR,
              expanded: true,
            },
            ...objects.map(object => k8sObjectToResult(object, NOT_CREATED)),
          ],
          false
        )
      );
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
      key: BASIC_SETTINGS_TAB_KEY,
      onCloseWizard: onCloseBasic,
      render: () => {
        const loadingData = {
          namespaces: this.props.namespaces,
          templates: this.props.templates,
          dataVolumes: this.props.dataVolumes,
        };
        return (
          <LoadingBasicWizardTab
            key="1"
            selectedNamespace={this.props.selectedNamespace}
            basicSettings={this.state.stepData[BASIC_SETTINGS_TAB_KEY].value}
            onChange={(value, valid) => this.onStepDataChanged(BASIC_SETTINGS_TAB_KEY, value, valid)}
            loadingData={loadingData}
            createTemplate={this.props.createTemplate}
            WithResources={this.props.WithResources}
            k8sCreate={this.props.k8sCreate}
            k8sGet={this.props.k8sGet}
            k8sPatch={this.props.k8sPatch}
            k8sKill={this.props.k8sKill}
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
            namespace={getBasicSettingsValue(this.state.stepData, NAMESPACE_KEY)}
            loadingData={loadingData}
            isCreateRemoveDisabled={!!getBasicSettingsValue(this.state.stepData, PROVIDER_VMWARE_VM_KEY)}
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
            namespace={getBasicSettingsValue(this.state.stepData, NAMESPACE_KEY)}
            loadingData={loadingData}
            isCreateRemoveDisabled={!!getBasicSettingsValue(this.state.stepData, PROVIDER_VMWARE_VM_KEY)}
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
          <ResultTab isSuccessful={stepData.valid} createTemplate={this.props.createTemplate}>
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
    return (
      <Wizard.Pattern
        show
        onHide={this.onHideWrapper}
        steps={this.wizardStepsNewVM}
        activeStepIndex={this.state.activeStepIndex}
        onStepChanged={index => this.onStepChanged(index)}
        previousStepDisabled={lastStepReached}
        cancelButtonDisabled={lastStepReached}
        stepButtonsDisabled={lastStepReached}
        nextStepDisabled={!this.state.stepData[this.wizardStepsNewVM[this.state.activeStepIndex].key].valid}
        nextText={beforeLastStepReached ? createVmText : NEXT}
        title={createVmText}
        dialogClassName="modal-lg wizard-pf kubevirt-wizard kubevirt-create-vm-wizard"
      />
    );
  }
}

CreateVmWizard.defaultProps = {
  templates: null,
  namespaces: null,
  selectedNamespace: null,
  networkConfigs: null,
  persistentVolumeClaims: null,
  storageClasses: null,
  createTemplate: false,
  dataVolumes: null,
};

CreateVmWizard.propTypes = {
  WithResources: PropTypes.func.isRequired,
  k8sCreate: PropTypes.func.isRequired,
  k8sGet: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  k8sKill: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  templates: PropTypes.array,
  namespaces: PropTypes.array,
  selectedNamespace: PropTypes.object,
  networkConfigs: PropTypes.array,
  persistentVolumeClaims: PropTypes.array,
  storageClasses: PropTypes.array,
  units: PropTypes.object.isRequired,
  createTemplate: PropTypes.bool,
  dataVolumes: PropTypes.array,
};

import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';

import BasicSettingsTab from './BasicSettingsTab';
import StorageTab from './StorageTab';
import ResultTab from './ResultTab';
import { getNameSpace } from '../../../utils/selectors';

import { createVM } from '../../../k8s/request';
import { POD_NETWORK, PROVISION_SOURCE_PXE } from '../../../constants';
import { NetworksTab } from './NetworksTab';
import { isImageSourceType, settingsValue } from '../../../k8s/selectors';
import { BASIC_SETTINGS_TAB_IDX, NETWORK_TAB_IDX, DISKS_TAB_IDX, RESULTS_TAB_IDX, NAMESPACE_KEY } from './constants';

const getBasicSettingsValue = (stepData, key) => settingsValue(stepData[BASIC_SETTINGS_TAB_IDX].value, key);

const onNamespaceChanged = (stepData, stepIdx) => {
  switch (stepIdx) {
    case DISKS_TAB_IDX:
      if (stepData.value.length > 0) {
        return {
          ...stepData,
          // cannot asses validity when namespace changes (if disks present)
          valid: false
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
        value: {}, // Basic Settings
        valid: false
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
              edit: false
            }
          ]
        },
        valid: true
      },
      {
        value: [], // Disks
        valid: true // empty Disks are valid
      },
      {
        value: '',
        valid: null // result of the request
      }
    ]
  };

  getLastStepIndex = () => this.state.stepData.length - 1;

  lastStepReached = () => this.state.activeStepIndex === this.getLastStepIndex();

  onStepDataChanged = (value, valid) => {
    this.setState(state => {
      const oldStepData = state.stepData;
      let stepData = [...oldStepData];

      stepData[state.activeStepIndex] = {
        value,
        valid
      };

      if (state.activeStepIndex === BASIC_SETTINGS_TAB_IDX) {
        // callbacks for changes on fields resolve new step data
        stepData = [{ field: NAMESPACE_KEY, callback: onNamespaceChanged }].reduce(
          (newStepData, { field, callback }) => {
            const oldValue = getBasicSettingsValue(oldStepData, field);
            const newValue = getBasicSettingsValue(newStepData, field);

            return oldValue === newValue ? newStepData : newStepData.map(callback);
          },
          stepData
        );
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
      title: 'Basic Settings',
      render: () => (
        <BasicSettingsTab
          key="1"
          namespaces={this.props.namespaces}
          selectedNamespace={this.props.selectedNamespace}
          templates={this.props.templates}
          basicSettings={this.state.stepData[BASIC_SETTINGS_TAB_IDX].value}
          onChange={this.onStepDataChanged}
        />
      )
    },
    {
      title: 'Network',
      render: () => (
        <NetworksTab
          onChange={this.onStepDataChanged}
          networkConfigs={this.props.networkConfigs}
          networks={this.state.stepData[NETWORK_TAB_IDX].value.networks || []}
          pxeBoot={isImageSourceType(this.state.stepData[BASIC_SETTINGS_TAB_IDX].value, PROVISION_SOURCE_PXE)}
        />
      )
    },
    {
      title: 'Storage',
      render: () => {
        const namespace = getBasicSettingsValue(this.state.stepData, NAMESPACE_KEY);
        const storages = this.props.storages.filter(storage => namespace && getNameSpace(storage) === namespace);
        return (
          <StorageTab
            storageClasses={this.props.storageClasses}
            storages={storages}
            initialDisks={this.state.stepData[DISKS_TAB_IDX].value}
            onChange={this.onStepDataChanged}
            units={this.props.units}
          />
        );
      }
    },
    {
      title: 'Result',
      render: () => {
        const stepData = this.state.stepData[RESULTS_TAB_IDX];
        return <ResultTab result={stepData.value} success={stepData.valid} />;
      }
    }
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
        nextText={beforeLastStepReached ? 'Create Virtual Machine' : 'Next'}
      />
    );
  }
}

CreateVmWizard.defaultProps = {
  selectedNamespace: undefined
};

CreateVmWizard.propTypes = {
  onHide: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  selectedNamespace: PropTypes.object,
  k8sCreate: PropTypes.func.isRequired,
  networkConfigs: PropTypes.array.isRequired,
  storages: PropTypes.array.isRequired,
  storageClasses: PropTypes.array.isRequired,
  units: PropTypes.object.isRequired
};

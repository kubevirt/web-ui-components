import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';

import BasicSettingsTab from './BasicSettingsTab';
import ResultTab from './ResultTab';

import { createVM } from '../../../k8s/request';
import { POD_NETWORK, PROVISION_SOURCE_PXE } from '../../../constants';
import { NetworksTab } from './NetworksTab';
import { isImageSourceType } from '../../../k8s/selectors';

export class CreateVmWizard extends React.Component {
  state = {
    activeStepIndex: 0,
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
              edit: false
            }
          ]
        },
        valid: true
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
      const stepData = [...state.stepData];
      stepData[state.activeStepIndex] = {
        value,
        valid
      };

      return { stepData };
    });
  };

  finish() {
    const stepValuesWithoutResult = this.state.stepData
      .slice(0, this.state.stepData.length - 1)
      .map(stepData => stepData.value);

    createVM(this.props.k8sCreate, this.props.templates, ...stepValuesWithoutResult)
      .then(result => this.onStepDataChanged(JSON.stringify(result, null, 1), true))
      .catch(error => this.onStepDataChanged(error.message, false));
  }

  onStepChanged = newActiveStepIndex => {
    // create Vm only once last step is reached
    if (!this.lastStepReached() && newActiveStepIndex === this.getLastStepIndex()) {
      this.finish();
    }

    this.setState(state => {
      if (
        state.activeStepIndex !== state.stepData.length - 1 && // do not allow going back once last step is reached
        (newActiveStepIndex < state.activeStepIndex || // allow going back to past steps
          state.stepData.slice(0, newActiveStepIndex).reduce((validity, item) => validity && item.valid, true))
      ) {
        return { activeStepIndex: newActiveStepIndex };
      }
      return null;
    });
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
          basicSettings={this.state.stepData[0].value}
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
          networks={this.state.stepData[1].value.networks || []}
          pxeBoot={isImageSourceType(this.state.stepData[0].value, PROVISION_SOURCE_PXE)}
        />
      )
    },
    {
      title: 'Result',
      render: () => {
        const stepData = this.state.stepData[this.getLastStepIndex()];
        return <ResultTab result={stepData.value} success={stepData.valid} />;
      }
    }
  ];

  render() {
    const beforeLastStepReached = this.state.activeStepIndex === this.state.stepData.length - 2;

    return (
      <Wizard.Pattern
        show
        onHide={this.props.onHide}
        steps={this.wizardStepsNewVM}
        activeStepIndex={this.state.activeStepIndex}
        onStepChanged={index => this.onStepChanged(index)}
        previousStepDisabled={this.lastStepReached()}
        stepButtonsDisabled={this.lastStepReached()}
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
  networkConfigs: PropTypes.array.isRequired
};

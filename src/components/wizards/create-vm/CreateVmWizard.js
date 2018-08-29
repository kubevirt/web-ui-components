import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';
import { get } from 'lodash';
import { createVM } from '../../../k8s/request';
import { FormFactory } from '../../forms/FormFactory';
import { isPositiveNumber } from '../../../utils/validation';

export class CreateVmWizard extends React.Component {
  state = {
    activeStepIndex: 0,
    basicVmSettings: {},
    wizardValid: false
  };

  onFormChange = (newValue, target) => {
    let validMsg;

    if (this.basicFormFields[target].validate) {
      validMsg = this.basicFormFields[target].validate(newValue);
    }
    if (this.basicFormFields[target].required && newValue.trim().length === 0) {
      validMsg = 'is required';
    }

    if (validMsg) {
      validMsg = `${this.basicFormFields[target].title} ${validMsg}`;
    }

    const basicVmSettings = {
      ...this.state.basicVmSettings,
      [target]: {
        value: newValue,
        validMsg
      }
    };
    this.setState({
      basicVmSettings
    });
    this.validateWizard(basicVmSettings);
  };

  validateWizard = values => {
    let wizardValid = true;

    // check if all required fields are defined
    const requiredKeys = Object.keys(this.basicFormFields).filter(key => this.isFieldRequired(key, values));
    const requiredKeysInValues = Object.keys(values).filter(key => this.isFieldRequired(key, values));
    if (requiredKeys.length !== requiredKeysInValues.length) {
      wizardValid = false;
    }

    // check if all fields are valid
    for (const key in values) {
      if (
        values[key].validMsg &&
        (this.basicFormFields[key].isVisible ? this.basicFormFields[key].isVisible(values) : true)
      ) {
        wizardValid = false;
        break;
      }
    }

    this.setState({
      wizardValid
    });
  };

  isFieldRequired = (key, basicVmSettings) =>
    this.basicFormFields[key].required &&
    (this.basicFormFields[key].isVisible ? this.basicFormFields[key].isVisible(basicVmSettings) : true);

  basicFormFields = {
    name: {
      title: 'Name',
      required: true
    },
    description: {
      title: 'Description',
      type: 'textarea'
    },
    namespace: {
      title: 'Namespace',
      type: 'dropdown',
      default: '--- Select Namespace ---',
      values: this.props.namespaces,
      required: true
    },
    imageSourceType: {
      title: 'Provision Source',
      type: 'dropdown',
      default: '--- Select Provision Source ---',
      values: [
        {
          name: 'PXE'
        },
        {
          name: 'URL'
        },
        {
          name: 'Template'
        },
        {
          name: 'Registry'
        }
      ],
      required: true
    },
    template: {
      title: 'Template',
      type: 'dropdown',
      default: '--- Select Template ---',
      required: true,
      isVisible: basicVmSettings => get(basicVmSettings, 'imageSourceType.value') === 'Template',
      values: this.props.templates
    },
    registryImage: {
      title: 'Registry Image',
      required: true,
      isVisible: basicVmSettings => get(basicVmSettings, 'imageSourceType.value') === 'Registry'
    },
    imageURL: {
      title: 'URL',
      required: true,
      isVisible: basicVmSettings => get(basicVmSettings, 'imageSourceType.value') === 'URL'
    },
    operatingSystem: {
      title: 'Operating System',
      type: 'dropdown',
      default: '--- Select Operating System ---',
      values: this.props.operatingSystems,
      required: true
    },
    flavor: {
      title: 'Flavor',
      type: 'dropdown',
      default: '--- Select Flavor ---',
      values: this.props.flavors.concat([{ name: 'Custom' }]),
      required: true
    },
    memory: {
      title: 'Memory (GB)',
      required: true,
      isVisible: basicVmSettings => get(basicVmSettings, 'flavor.value', '') === 'Custom',
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    cpu: {
      title: 'CPUs',
      required: true,
      isVisible: basicVmSettings => get(basicVmSettings, 'flavor.value', '') === 'Custom',
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    workloadProfile: {
      title: 'Workload Profile',
      type: 'dropdown',
      default: '--- Select Workload Profile ---',
      values: this.props.workloadProfiles,
      required: true,
      help: () =>
        this.props.workloadProfiles.map(value => (
          <p>
            <b>{value.name}</b>: {value.description}
          </p>
        ))
    },
    startVM: {
      title: 'Start virtual machine on creation',
      type: 'checkbox',
      noBottom: true
    },
    createTemplate: {
      title: 'Create new template from configuration',
      type: 'checkbox',
      noBottom: true
    },
    cloudInit: {
      title: 'Use cloud-init',
      type: 'checkbox'
    },
    hostname: {
      title: 'Hostname',
      isVisible: basicVmSettings => get(basicVmSettings, 'cloudInit.value', false),
      required: true
    },
    authKeys: {
      title: 'Authenticated SSH Keys',
      type: 'textarea',
      isVisible: basicVmSettings => get(basicVmSettings, 'cloudInit.value', false),
      required: true
    }
  };

  wizardStepsNewVM = [
    {
      title: 'Basic Settings',
      render: () => (
        <FormFactory
          fields={this.basicFormFields}
          fieldsValues={this.state.basicVmSettings}
          onFormChange={this.onFormChange}
        />
      )
    },
    {
      title: 'Result',
      render: () => {
        createVM(this.state.basicVmSettings, this.state.network, this.state.storage);
        return <p>object visible in console</p>;
      }
    }
  ];

  onStepChanged = index => {
    this.setState({ activeStepIndex: index });
  };

  render() {
    return (
      <Wizard.Pattern
        show
        onHide={this.props.onHide}
        steps={this.wizardStepsNewVM}
        activeStepIndex={this.state.activeStepIndex}
        onStepChanged={index => this.onStepChanged(index)}
        nextStepDisabled={!this.state.wizardValid}
        nextText={this.state.activeStepIndex === 0 ? 'Create Virtual Machine' : 'Next'}
      />
    );
  }
}

CreateVmWizard.propTypes = {
  onHide: PropTypes.func.isRequired,
  workloadProfiles: PropTypes.array.isRequired,
  flavors: PropTypes.array.isRequired,
  operatingSystems: PropTypes.array.isRequired,
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired
};

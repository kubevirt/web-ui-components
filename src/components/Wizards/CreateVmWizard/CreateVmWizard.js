import React from 'react';
import PropTypes from 'prop-types';
import { Wizard } from 'patternfly-react';
import { get, has, cloneDeep } from 'lodash';
import { createVM } from '../../../k8s/request';
import { FormFactory } from '../../Forms/FormFactory';
import { isPositiveNumber } from '../../../utils/validation';
import {
  CUSTOM_FLAVOR,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_OS_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_VM,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_TEMPLATE,
  baseTemplates as predefinedTemplates
} from '../../../constants';
import { getTemplatesWithLabels, getTemplatesLabelValues } from '../../../utils/template';

export class CreateVmWizard extends React.Component {
  state = {
    activeStepIndex: 0,
    basicVmSettings: {},
    wizardValid: false
  };

  getTemplate = type => {
    if (type === TEMPLATE_TYPE_BASE) {
      return predefinedTemplates;
    }
    return this.props.templates.filter(template => {
      const labels = get(template, 'metadata.labels', {});
      return labels[TEMPLATE_TYPE_LABEL] === type;
    });
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

    this.setState(state => ({
      basicVmSettings: {
        ...state.basicVmSettings,
        [target]: {
          value: newValue,
          validMsg
        }
      }
    }));
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

  isImageSourceType = (basicVmSettings, type) => get(basicVmSettings, 'imageSourceType.value') === type;

  isFlavorType = (basicVmSettings, type) => get(basicVmSettings, 'flavor.value') === type;

  isFieldRequired = (key, basicVmSettings) => {
    const field = this.basicFormFields[key];
    if (field.required) {
      return field.isVisible ? field.isVisible(basicVmSettings) : true;
    }
    return false;
  };

  getFlavorLabel = () => {
    if (has(this.state.basicVmSettings, 'flavor.value')) {
      const flavorValue = this.state.basicVmSettings.flavor.value;
      if (flavorValue !== CUSTOM_FLAVOR) {
        return `${TEMPLATE_FLAVOR_LABEL}/${this.state.basicVmSettings.flavor.value}`;
      }
    }
    return undefined;
  };

  getWorkloadLabel = () => this.getLabel(TEMPLATE_WORKLOAD_LABEL, 'workloadProfile');

  getOsLabel = () => this.getLabel(TEMPLATE_OS_LABEL, 'operatingSystem');

  getLabel = (labelPrefix, value) =>
    has(this.state.basicVmSettings, value)
      ? `${labelPrefix}/${get(this.state.basicVmSettings, [value, 'value'])}`
      : undefined;

  getOperatingSystems = () => {
    const templates = getTemplatesWithLabels(this.getTemplate(TEMPLATE_TYPE_BASE), [
      this.getWorkloadLabel(),
      this.getFlavorLabel()
    ]);
    return getTemplatesLabelValues(templates, TEMPLATE_OS_LABEL);
  };

  getWorkloadProfiles = () => {
    const templates = getTemplatesWithLabels(this.getTemplate(TEMPLATE_TYPE_BASE), [
      this.getOsLabel(),
      this.getFlavorLabel()
    ]);
    return getTemplatesLabelValues(templates, TEMPLATE_WORKLOAD_LABEL);
  };

  getFlavors = () => {
    const templates = getTemplatesWithLabels(this.getTemplate(TEMPLATE_TYPE_BASE), [
      this.getWorkloadLabel(),
      this.getOsLabel()
    ]);
    const flavors = getTemplatesLabelValues(templates, TEMPLATE_FLAVOR_LABEL);
    flavors.push(CUSTOM_FLAVOR);
    return flavors;
  };

  getName = resource => resource.metadata.name;

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
      values: () => this.props.namespaces.map(namespace => this.getName(namespace)),
      required: true
    },
    imageSourceType: {
      title: 'Provision Source',
      type: 'dropdown',
      default: '--- Select Provision Source ---',
      values: [PROVISION_SOURCE_PXE, PROVISION_SOURCE_URL, PROVISION_SOURCE_REGISTRY, PROVISION_SOURCE_TEMPLATE],
      required: true
    },
    registryImage: {
      title: 'Registry Image',
      required: true,
      isVisible: basicVmSettings => this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_REGISTRY)
    },
    imageURL: {
      title: 'URL',
      required: true,
      isVisible: basicVmSettings => this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_URL)
    },
    userTemplate: {
      title: 'Template',
      type: 'dropdown',
      default: '--- Select Template ---',
      values: () => this.getTemplate(TEMPLATE_TYPE_VM).map(template => this.getName(template)),
      isVisible: basicVmSettings => this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      required: true
    },
    operatingSystem: {
      title: 'Operating System',
      type: 'dropdown',
      default: '--- Select Operating System ---',
      values: this.getOperatingSystems,
      required: true,
      isVisible: basicVmSettings => !this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE)
    },
    flavor: {
      title: 'Flavor',
      type: 'dropdown',
      default: '--- Select Flavor ---',
      values: this.getFlavors,
      required: true,
      isVisible: basicVmSettings => !this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE)
    },
    memory: {
      title: 'Memory (GB)',
      required: true,
      isVisible: basicVmSettings =>
        this.isFlavorType(basicVmSettings, CUSTOM_FLAVOR) ||
        this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    cpu: {
      title: 'CPUs',
      required: true,
      isVisible: basicVmSettings =>
        this.isFlavorType(basicVmSettings, CUSTOM_FLAVOR) ||
        this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    workloadProfile: {
      title: 'Workload Profile',
      type: 'dropdown',
      default: '--- Select Workload Profile ---',
      values: this.getWorkloadProfiles,
      required: true,
      isVisible: basicVmSettings => !this.isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      help: () =>
        this.getWorkloadProfiles().map(profile => (
          <p key={profile}>
            <b>{profile}</b>: {profile}
          </p>
        ))
    },
    startVM: {
      title: 'Start virtual machine on creation',
      type: 'checkbox',
      noBottom: true
    },
    /*
    createTemplate: {
      title: 'Create new template from configuration',
      type: 'checkbox',
      noBottom: true
    },
    */
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
        const result = this.state.result ? this.state.result : 'creating VM...';
        return <p>{result}</p>;
      }
    }
  ];

  onStepChanged = index => {
    this.setState({ activeStepIndex: index });
    if (index === 1) {
      const basicSettings = {
        ...this.state.basicVmSettings
      };
      const availableTemplates = [];
      if (basicSettings.imageSourceType.value === PROVISION_SOURCE_TEMPLATE) {
        const userTemplate = this.props.templates.find(
          template => template.metadata.name === basicSettings.userTemplate.value
        );
        availableTemplates.push(userTemplate);
      } else {
        const templates = getTemplatesWithLabels(this.getTemplate(TEMPLATE_TYPE_BASE), [
          this.getOsLabel(),
          this.getWorkloadLabel(),
          this.getFlavorLabel()
        ]);
        availableTemplates.push(...templates);
      }
      basicSettings.chosenTemplate = cloneDeep(availableTemplates[0]);
      createVM(this.props.k8sCreate, basicSettings, this.state.network, this.state.storage)
        .then(result =>
          this.setState({
            result: `VM ${result.metadata.name} created`
          })
        )
        .catch(error =>
          this.setState({
            result: error.message
          })
        );
    }
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
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  k8sCreate: PropTypes.func.isRequired
};

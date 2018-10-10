import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormFactory } from '../../Forms/FormFactory';
import { isPositiveNumber } from '../../../utils/validation';
import { getName } from '../../../utils/selectors';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_TEMPLATE,
  TEMPLATE_TYPE_VM
} from '../../../constants';
import {
  getOperatingSystems,
  getWorkloadProfiles,
  getFlavors,
  isImageSourceType,
  isFlavorType,
  getTemplate
} from '../../../k8s/selectors';

export const getFormFields = (basicSettings, namespaces, templates) => {
  const workloadProfiles = getWorkloadProfiles(basicSettings, templates);
  const operatingSystems = getOperatingSystems(basicSettings, templates);
  const flavors = getFlavors(basicSettings, templates);

  namespaces = namespaces.map(getName);

  return {
    name: {
      title: 'Name',
      required: true
    },
    description: {
      title: 'Description',
      type: 'textarea'
    },
    namespace: {
      id: 'namespace-dropdown',
      title: 'Namespace',
      type: 'dropdown',
      defaultValue: '--- Select Namespace ---',
      choices: namespaces,
      required: true
    },
    imageSourceType: {
      id: 'image-source-type-dropdown',
      title: 'Provision Source',
      type: 'dropdown',
      defaultValue: '--- Select Provision Source ---',
      choices: [PROVISION_SOURCE_PXE, PROVISION_SOURCE_URL, PROVISION_SOURCE_REGISTRY, PROVISION_SOURCE_TEMPLATE],
      required: true
    },
    registryImage: {
      title: 'Registry Image',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_REGISTRY)
    },
    imageURL: {
      title: 'URL',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_URL)
    },
    userTemplate: {
      title: 'Template',
      type: 'dropdown',
      defaultValue: '--- Select Template ---',
      choices: getTemplate(templates, TEMPLATE_TYPE_VM).map(getName),
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      required: true
    },
    operatingSystem: {
      id: 'operating-system-dropdown',
      title: 'Operating System',
      type: 'dropdown',
      defaultValue: '--- Select Operating System ---',
      choices: operatingSystems,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE)
    },
    flavor: {
      id: 'flavor-dropdown',
      title: 'Flavor',
      type: 'dropdown',
      defaultValue: '--- Select Flavor ---',
      choices: flavors,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE)
    },
    memory: {
      title: 'Memory (GB)',
      required: true,
      isVisible: basicVmSettings =>
        isFlavorType(basicVmSettings, CUSTOM_FLAVOR) || isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    cpu: {
      title: 'CPUs',
      required: true,
      isVisible: basicVmSettings =>
        isFlavorType(basicVmSettings, CUSTOM_FLAVOR) || isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      validate: currentValue => (isPositiveNumber(currentValue) ? undefined : 'must be a number')
    },
    workloadProfile: {
      id: 'workload-profile-dropdown',
      title: 'Workload Profile',
      type: 'dropdown',
      defaultValue: '--- Select Workload Profile ---',
      choices: workloadProfiles,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      help: () =>
        workloadProfiles.map(profile => (
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
};

class BasicSettingsTab extends React.Component {
  onFormChange = (formFields, newValue, target) => {
    let validMsg;

    if (formFields[target].validate) {
      validMsg = formFields[target].validate(newValue);
    }
    if (formFields[target].required && newValue.trim().length === 0) {
      validMsg = 'is required';
    }

    if (validMsg) {
      validMsg = `${formFields[target].title} ${validMsg}`;
    }

    const basicSettings = {
      ...this.props.basicSettings,
      [target]: {
        value: newValue,
        validMsg
      }
    };

    this.props.onChange(basicSettings, this.validateWizard(formFields, basicSettings));
  };

  validateWizard = (formFields, values) => {
    let wizardValid = true;

    // check if all required fields are defined
    const requiredKeys = Object.keys(formFields).filter(key => this.isFieldRequired(formFields, key, values));
    const requiredKeysInValues = Object.keys(values).filter(key => this.isFieldRequired(formFields, key, values));

    if (requiredKeys.length !== requiredKeysInValues.length) {
      wizardValid = false;
    }

    // check if all fields are valid
    for (const key in values) {
      if (get(values[key], 'validMsg') && (formFields[key].isVisible ? formFields[key].isVisible(values) : true)) {
        wizardValid = false;
        break;
      }
    }

    return wizardValid;
  };

  isFieldRequired = (formFields, key, basicVmSettings) => {
    const field = formFields[key];
    if (field && field.required) {
      return field.isVisible ? field.isVisible(basicVmSettings) : true;
    }
    return false;
  };

  render() {
    const { basicSettings, namespaces, templates } = this.props;
    const formFields = getFormFields(basicSettings, namespaces, templates);

    return (
      <FormFactory
        fields={formFields}
        fieldsValues={basicSettings}
        onFormChange={(newValue, target) => this.onFormChange(formFields, newValue, target)}
      />
    );
  }
}

BasicSettingsTab.propTypes = {
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  basicSettings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default BasicSettingsTab;

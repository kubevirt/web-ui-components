import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormFactory } from '../../Form/FormFactory';
import { getName } from '../../../utils/selectors';
import { getTemplate } from '../../../utils/templates';
import { validateDNS1123SubdomainValue, getValidationObject } from '../../../utils/validations';
import {
  getFlavors,
  getOperatingSystems,
  getWorkloadProfiles,
  isFlavorType,
  isImageSourceType,
} from '../../../k8s/selectors';

import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_REGISTRY,
  PROVISION_SOURCE_TEMPLATE,
  PROVISION_SOURCE_URL,
  TEMPLATE_TYPE_VM,
  VALIDATION_ERROR_TYPE,
} from '../../../constants';
import {
  NAME_KEY,
  NAMESPACE_KEY,
  DESCRIPTION_KEY,
  IMAGE_SOURCE_TYPE_KEY,
  REGISTRY_IMAGE_KEY,
  IMAGE_URL_KEY,
  USER_TEMPLATE_KEY,
  OPERATING_SYSTEM_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
  CPU_KEY,
  WORKLOAD_PROFILE_KEY,
  START_VM_KEY,
  CLOUD_INIT_KEY,
  HOST_NAME_KEY,
  AUTHKEYS_KEY,
  IMAGE_URL_SIZE_KEY,
} from './constants';
import { ERROR_IS_REQUIRED } from './strings';

export const getFormFields = (basicSettings, namespaces, templates, selectedNamespace) => {
  const workloadProfiles = getWorkloadProfiles(basicSettings, templates);
  const operatingSystems = getOperatingSystems(basicSettings, templates);
  const flavors = getFlavors(basicSettings, templates);

  let namespaceDropdown;

  if (!selectedNamespace) {
    namespaceDropdown = {
      id: 'namespace-dropdown',
      title: 'Namespace',
      type: 'dropdown',
      defaultValue: '--- Select Namespace ---',
      choices: namespaces.map(getName),
      required: true,
    };
  }

  return {
    [NAME_KEY]: {
      id: 'vm-name',
      title: 'Name',
      required: true,
      validate: validateDNS1123SubdomainValue,
    },
    [DESCRIPTION_KEY]: {
      id: 'vm-description',
      title: 'Description',
      type: 'textarea',
    },
    [NAMESPACE_KEY]: namespaceDropdown,
    [IMAGE_SOURCE_TYPE_KEY]: {
      id: 'image-source-type-dropdown',
      title: 'Provision Source',
      type: 'dropdown',
      defaultValue: '--- Select Provision Source ---',
      choices: [PROVISION_SOURCE_PXE, PROVISION_SOURCE_URL, PROVISION_SOURCE_REGISTRY, PROVISION_SOURCE_TEMPLATE],
      required: true,
    },
    [REGISTRY_IMAGE_KEY]: {
      id: 'provision-source-registry',
      title: 'Registry Image',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_REGISTRY),
    },
    [IMAGE_URL_KEY]: {
      id: 'provision-source-url',
      title: 'URL',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_URL),
    },
    [IMAGE_URL_SIZE_KEY]: {
      title: 'Disk Size (GB)',
      type: 'positive-number',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_URL),
    },
    [USER_TEMPLATE_KEY]: {
      id: 'template-dropdown',
      title: 'Template',
      type: 'dropdown',
      defaultValue: '--- Select Template ---',
      choices: getTemplate(templates, TEMPLATE_TYPE_VM).map(getName),
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      required: true,
    },
    [OPERATING_SYSTEM_KEY]: {
      id: 'operating-system-dropdown',
      title: 'Operating System',
      type: 'dropdown',
      defaultValue: '--- Select Operating System ---',
      choices: operatingSystems,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
    },
    [FLAVOR_KEY]: {
      id: 'flavor-dropdown',
      title: 'Flavor',
      type: 'dropdown',
      defaultValue: '--- Select Flavor ---',
      choices: flavors,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
    },
    [MEMORY_KEY]: {
      id: 'resources-memory',
      title: 'Memory (GB)',
      type: 'positive-number',
      required: true,
      isVisible: basicVmSettings =>
        isFlavorType(basicVmSettings, CUSTOM_FLAVOR) || isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
    },
    [CPU_KEY]: {
      id: 'resources-cpu',
      title: 'CPUs',
      type: 'positive-number',
      required: true,
      isVisible: basicVmSettings =>
        isFlavorType(basicVmSettings, CUSTOM_FLAVOR) || isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
    },
    [WORKLOAD_PROFILE_KEY]: {
      id: 'workload-profile-dropdown',
      title: 'Workload Profile',
      type: 'dropdown',
      defaultValue: '--- Select Workload Profile ---',
      choices: workloadProfiles,
      required: true,
      isVisible: basicVmSettings => !isImageSourceType(basicVmSettings, PROVISION_SOURCE_TEMPLATE),
      help: workloadProfiles.map(profile => (
        <p key={profile}>
          <b>{profile}</b>: {profile}
        </p>
      )),
    },
    [START_VM_KEY]: {
      id: 'start-vm',
      title: 'Start virtual machine on creation',
      type: 'checkbox',
      noBottom: true,
    },
    /*
      [CREATE_TEMPLATE_KEY]: {
        title: 'Create new template from configuration',
        type: 'checkbox',
        noBottom: true
      },
      */
    [CLOUD_INIT_KEY]: {
      id: 'use-cloud-init',
      title: 'Use cloud-init',
      type: 'checkbox',
    },
    [HOST_NAME_KEY]: {
      id: 'cloud-init-hostname',
      title: 'Hostname',
      isVisible: basicVmSettings => get(basicVmSettings, 'cloudInit.value', false),
    },
    [AUTHKEYS_KEY]: {
      id: 'cloud-init-ssh',
      title: 'Authenticated SSH Keys',
      type: 'textarea',
      isVisible: basicVmSettings => get(basicVmSettings, 'cloudInit.value', false),
    },
  };
};

const isFieldRequired = (formFields, key, basicVmSettings) => {
  const field = formFields[key];
  if (field && field.required) {
    return field.isVisible ? field.isVisible(basicVmSettings) : true;
  }
  return false;
};

const validateWizard = (formFields, values) => {
  let wizardValid = true;

  // check if all required fields are defined
  const requiredKeys = Object.keys(formFields).filter(key => isFieldRequired(formFields, key, values));
  const requiredKeysInValues = Object.keys(values).filter(key => isFieldRequired(formFields, key, values));

  if (requiredKeys.length !== requiredKeysInValues.length) {
    wizardValid = false;
  }

  // check if all fields are valid
  for (const key in values) {
    if (
      get(values[key], 'validation.type') === VALIDATION_ERROR_TYPE &&
      (formFields[key].isVisible ? formFields[key].isVisible(values) : true)
    ) {
      wizardValid = false;
      break;
    }
  }

  return wizardValid;
};

const asValueObject = (value, validation) => ({
  value,
  validation,
});

const publish = ({ basicSettings, namespaces, templates, selectedNamespace, onChange }, value, target, formFields) => {
  if (!formFields) {
    formFields = getFormFields(basicSettings, namespaces, templates, selectedNamespace);
  }

  const newBasicSettings = {
    ...basicSettings,
    [target]: value,
  };

  if (target === IMAGE_SOURCE_TYPE_KEY && value.value === PROVISION_SOURCE_TEMPLATE) {
    const currentUserTemplate = get(newBasicSettings.userTemplate, 'value');
    if (!currentUserTemplate) {
      const allTemplates = getTemplate(templates, TEMPLATE_TYPE_VM);
      if (allTemplates.length > 0) {
        newBasicSettings.userTemplate = asValueObject(getName(allTemplates[0]));
      }
    }
  }

  onChange(newBasicSettings, validateWizard(formFields, newBasicSettings)); // not valid
};

class BasicSettingsTab extends React.Component {
  constructor(props) {
    super(props);
    if (props.selectedNamespace) {
      publish(props, asValueObject(getName(props.selectedNamespace)), NAMESPACE_KEY);
    }
  }

  componentDidUpdate(prevProps) {
    const newNamespace = this.props.selectedNamespace;
    const oldNamespace = prevProps.selectedNamespace;

    if (newNamespace && getName(newNamespace) !== getName(oldNamespace)) {
      publish(this.props, asValueObject(getName(newNamespace)), NAMESPACE_KEY);
    }
  }

  onFormChange = (formFields, newValue, target) => {
    let validation;

    if (formFields[target].required && newValue.trim().length === 0) {
      validation = getValidationObject(ERROR_IS_REQUIRED);
    } else if (formFields[target].validate) {
      validation = formFields[target].validate(newValue);
    }

    if (validation) {
      validation.message = `${formFields[target].title} ${validation.message}`;
    }

    publish(this.props, asValueObject(newValue, validation), target, formFields);
  };

  render() {
    const { basicSettings, namespaces, templates, selectedNamespace } = this.props;
    const formFields = getFormFields(basicSettings, namespaces, templates, selectedNamespace);

    return (
      <FormFactory
        fields={formFields}
        fieldsValues={basicSettings}
        onFormChange={(newValue, target) => this.onFormChange(formFields, newValue, target)}
      />
    );
  }
}

BasicSettingsTab.defaultProps = {
  selectedNamespace: undefined,
};

BasicSettingsTab.propTypes = {
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  selectedNamespace: PropTypes.object, // used only in initialization
  basicSettings: PropTypes.object.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onChange: PropTypes.func.isRequired,
};

export default BasicSettingsTab;

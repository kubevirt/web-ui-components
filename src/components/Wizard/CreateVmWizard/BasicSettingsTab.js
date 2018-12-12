import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormFactory } from '../../Form/FormFactory';
import { getName, getMemory, getCpu, getCloudInitData } from '../../../utils/selectors';
import { getTemplate, getTemplateProvisionSource } from '../../../utils/templates';
import { validateDNS1123SubdomainValue } from '../../../utils/validations';
import {
  getFlavors,
  getOperatingSystems,
  getWorkloadProfiles,
  isFlavorType,
  isImageSourceType,
  selectVm,
  getTemplateFlavors,
  getTemplateWorkloadProfiles,
  getTemplateOperatingSystems,
} from '../../../k8s/selectors';

import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  TEMPLATE_TYPE_VM,
  VALIDATION_ERROR_TYPE,
} from '../../../constants';
import {
  NAME_KEY,
  NAMESPACE_KEY,
  DESCRIPTION_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  CONTAINER_IMAGE_KEY,
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
} from './constants';
import { NO_TEMPLATE } from './strings';

export const getFormFields = (basicSettings, namespaces, templates, selectedNamespace, createTemplate) => {
  const userTemplate = get(basicSettings[USER_TEMPLATE_KEY], 'value');
  const workloadProfiles = getWorkloadProfiles(basicSettings, templates, userTemplate);
  const operatingSystems = getOperatingSystems(basicSettings, templates, userTemplate);
  const flavors = getFlavors(basicSettings, templates, userTemplate);
  const imageSources = [PROVISION_SOURCE_PXE, PROVISION_SOURCE_URL, PROVISION_SOURCE_CONTAINER];
  const userTemplateNames = getTemplate(templates, TEMPLATE_TYPE_VM).map(getName);
  userTemplateNames.push(NO_TEMPLATE);

  let namespaceDropdown;
  let startVmCheckbox;
  let userTemplateDropdown;

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

  if (!createTemplate) {
    startVmCheckbox = {
      id: 'start-vm',
      title: 'Start virtual machine on creation',
      type: 'checkbox',
      noBottom: true,
    };
    userTemplateDropdown = {
      id: 'template-dropdown',
      title: 'Template',
      type: 'dropdown',
      defaultValue: '--- Select Template ---',
      choices: userTemplateNames,
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
    [USER_TEMPLATE_KEY]: userTemplateDropdown,
    [PROVISION_SOURCE_TYPE_KEY]: {
      id: 'image-source-type-dropdown',
      title: 'Provision Source',
      type: 'dropdown',
      defaultValue: '--- Select Provision Source ---',
      choices: imageSources,
      required: true,
      disabled: userTemplate !== undefined,
    },
    [CONTAINER_IMAGE_KEY]: {
      id: 'provision-source-container',
      title: 'Container Image',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_CONTAINER),
      disabled: userTemplate !== undefined,
    },
    [IMAGE_URL_KEY]: {
      id: 'provision-source-url',
      title: 'URL',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_URL),
      disabled: userTemplate !== undefined,
    },
    [OPERATING_SYSTEM_KEY]: {
      id: 'operating-system-dropdown',
      title: 'Operating System',
      type: 'dropdown',
      defaultValue: '--- Select Operating System ---',
      choices: operatingSystems,
      required: true,
      disabled: userTemplate !== undefined,
    },
    [FLAVOR_KEY]: {
      id: 'flavor-dropdown',
      title: 'Flavor',
      type: 'dropdown',
      defaultValue: '--- Select Flavor ---',
      choices: flavors,
      required: true,
      disabled: userTemplate !== undefined && flavors.length === 1,
    },
    [MEMORY_KEY]: {
      id: 'resources-memory',
      title: 'Memory (GB)',
      type: 'positive-number',
      required: true,
      isVisible: basicVmSettings => isFlavorType(basicVmSettings, CUSTOM_FLAVOR),
    },
    [CPU_KEY]: {
      id: 'resources-cpu',
      title: 'CPUs',
      type: 'positive-number',
      required: true,
      isVisible: basicVmSettings => isFlavorType(basicVmSettings, CUSTOM_FLAVOR),
    },
    [WORKLOAD_PROFILE_KEY]: {
      id: 'workload-profile-dropdown',
      title: 'Workload Profile',
      type: 'dropdown',
      defaultValue: '--- Select Workload Profile ---',
      choices: workloadProfiles,
      required: true,
      help: workloadProfiles.map(profile => (
        <p key={profile}>
          <b>{profile}</b>: {profile}
        </p>
      )),
      disabled: userTemplate !== undefined,
    },
    [START_VM_KEY]: startVmCheckbox,
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

  const newBasicSettings = { ...basicSettings };

  if (target) {
    newBasicSettings[target] = value;
  }

  if (target === USER_TEMPLATE_KEY) {
    if (value.value === NO_TEMPLATE) {
      newBasicSettings[target] = asValueObject(undefined);
    } else {
      const allTemplates = getTemplate(templates, TEMPLATE_TYPE_VM);
      if (allTemplates.length > 0) {
        const userTemplate = allTemplates.find(template => template.metadata.name === value.value);
        updateTemplateData(userTemplate, newBasicSettings);
      }
    }
  }

  onChange(newBasicSettings, validateWizard(formFields, newBasicSettings));
};

const updateTemplateData = (userTemplate, newBasicSettings) => {
  if (userTemplate) {
    const vm = selectVm(userTemplate.objects);

    // update flavor
    const [flavor] = getTemplateFlavors([userTemplate]);
    newBasicSettings[FLAVOR_KEY] = asValueObject(flavor);
    if (flavor === CUSTOM_FLAVOR) {
      newBasicSettings.cpu = asValueObject(getCpu(vm));
      const memory = getMemory(vm);
      newBasicSettings.memory = memory ? asValueObject(parseInt(memory, 10)) : undefined;
    }

    // update os
    const [os] = getTemplateOperatingSystems([userTemplate]);
    newBasicSettings[OPERATING_SYSTEM_KEY] = asValueObject(os);

    // update workload profile
    const [workload] = getTemplateWorkloadProfiles([userTemplate]);
    newBasicSettings[WORKLOAD_PROFILE_KEY] = asValueObject(workload);

    // update cloud-init
    const cloudInit = getCloudInitData(vm);
    if (cloudInit) {
      newBasicSettings[CLOUD_INIT_KEY] = asValueObject(true);

      const { userData } = cloudInit;

      newBasicSettings[HOST_NAME_KEY] = asValueObject(userData.hostname || '');

      const users = userData.users || [];
      const rootUser = users.find(user => user.name === 'root');
      newBasicSettings[AUTHKEYS_KEY] = asValueObject(rootUser['ssh-authorized-keys'] || '');
    } else if (get(newBasicSettings[CLOUD_INIT_KEY], 'value')) {
      newBasicSettings[CLOUD_INIT_KEY] = asValueObject(false);
    }

    // update provision source
    const provisionSource = getTemplateProvisionSource(userTemplate);
    if (provisionSource) {
      newBasicSettings[PROVISION_SOURCE_TYPE_KEY] = asValueObject(provisionSource.type);
      switch (provisionSource.type) {
        case PROVISION_SOURCE_CONTAINER:
          newBasicSettings[CONTAINER_IMAGE_KEY] = asValueObject(provisionSource.source);
          break;
        case PROVISION_SOURCE_URL:
          newBasicSettings[IMAGE_URL_KEY] = asValueObject(provisionSource.source);
          break;
        case PROVISION_SOURCE_PXE:
          break;
        default:
          // eslint-disable-next-line
          console.warn(`Unknown provision source ${provisionSource.type}`);
          break;
      }
    } else {
      // eslint-disable-next-line
      console.warn(`Cannot detect provision source for template ${getName(userTemplate)}`);
    }
  }
  return newBasicSettings;
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

  render() {
    const { basicSettings, namespaces, templates, selectedNamespace, createTemplate } = this.props;
    const formFields = getFormFields(basicSettings, namespaces, templates, selectedNamespace, createTemplate);

    return (
      <FormFactory
        fields={formFields}
        fieldsValues={basicSettings}
        onFormChange={(newValue, target) => publish(this.props, newValue, target, formFields)}
      />
    );
  }
}

BasicSettingsTab.defaultProps = {
  selectedNamespace: undefined,
  createTemplate: false,
};

BasicSettingsTab.propTypes = {
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  selectedNamespace: PropTypes.object, // used only in initialization
  basicSettings: PropTypes.object.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onChange: PropTypes.func.isRequired,
  createTemplate: PropTypes.bool,
};

export default BasicSettingsTab;

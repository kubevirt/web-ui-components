import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import {
  FormFactory,
  validateForm,
  getFieldValidation,
  DROPDOWN,
  CHECKBOX,
  TEXT_AREA,
  POSITIVE_NUMBER,
} from '../../Form';
import { getName, getMemory, getCpu, getCloudInitUserData } from '../../../selectors';
import { getTemplate, getTemplateProvisionSource } from '../../../utils/templates';
import { validateDNS1123SubdomainValue, validateURL, validateContainer } from '../../../utils/validations';
import {
  NO_TEMPLATE,
  HELP_OS,
  HELP_FLAVOR,
  HELP_MEMORY,
  HELP_CPU,
  HELP_WORKLOAD,
  getProvisionSourceHelp,
} from './strings';

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
  settingsValue,
  getV2VVmwareName,
} from '../../../k8s/selectors';

import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_CLONED_DISK,
  TEMPLATE_TYPE_VM,
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
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  HOST_NAME_KEY,
  AUTHKEYS_KEY,
  BATCH_CHANGES_KEY,
  INTERMEDIARY_NETWORKS_TAB_KEY,
  INTERMEDIARY_STORAGE_TAB_KEY,
} from './constants';

import { importProviders } from './providers';
import { V2VVMwareModel } from '../../../models';

export const getFormFields = (
  basicSettings,
  namespaces,
  templates,
  selectedNamespace,
  createTemplate,
  WithResources,
  k8sCreate,
  k8sGet,
  k8sPatch
) => {
  const userTemplate = get(basicSettings[USER_TEMPLATE_KEY], 'value');
  const workloadProfiles = getWorkloadProfiles(basicSettings, templates, userTemplate);
  const operatingSystems = getOperatingSystems(basicSettings, templates, userTemplate);
  const flavors = getFlavors(basicSettings, templates, userTemplate);
  const imageSources = [
    PROVISION_SOURCE_PXE,
    PROVISION_SOURCE_URL,
    PROVISION_SOURCE_CONTAINER,
    PROVISION_SOURCE_CLONED_DISK,
  ];
  const userTemplateNames = getTemplate(templates, TEMPLATE_TYPE_VM).map(getName);
  userTemplateNames.push(NO_TEMPLATE);

  let namespaceDropdown;
  let startVmCheckbox;
  let userTemplateDropdown;
  let providersSection = {};

  if (!selectedNamespace) {
    namespaceDropdown = {
      id: 'namespace-dropdown',
      title: 'Namespace',
      type: DROPDOWN,
      defaultValue: '--- Select Namespace ---',
      choices: namespaces.map(getName),
      required: true,
    };
  }

  if (!createTemplate) {
    startVmCheckbox = {
      id: 'start-vm',
      title: 'Start virtual machine on creation',
      type: CHECKBOX,
      noBottom: true,
    };
    userTemplateDropdown = {
      id: 'template-dropdown',
      title: 'Template',
      type: DROPDOWN,
      defaultValue: '--- Select Template ---',
      choices: userTemplateNames,
    };

    providersSection = importProviders(basicSettings, operatingSystems, WithResources, k8sCreate, k8sGet, k8sPatch);
    imageSources.push(PROVISION_SOURCE_IMPORT);
  }

  return {
    [NAME_KEY]: {
      id: 'vm-name',
      title: 'Name',
      required: true,
      validate: settings => validateDNS1123SubdomainValue(settingsValue(settings, NAME_KEY)),
    },
    [DESCRIPTION_KEY]: {
      id: 'vm-description',
      title: 'Description',
      type: TEXT_AREA,
    },
    [NAMESPACE_KEY]: namespaceDropdown,
    [USER_TEMPLATE_KEY]: userTemplateDropdown,
    [PROVISION_SOURCE_TYPE_KEY]: {
      id: 'image-source-type-dropdown',
      title: 'Provision Source',
      type: DROPDOWN,
      defaultValue: '--- Select Provision Source ---',
      choices: imageSources,
      required: true,
      disabled: userTemplate !== undefined,
      help: getProvisionSourceHelp(settingsValue(basicSettings, PROVISION_SOURCE_TYPE_KEY)),
    },
    [CONTAINER_IMAGE_KEY]: {
      id: 'provision-source-container',
      title: 'Container Image',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_CONTAINER),
      disabled: userTemplate !== undefined,
      validate: settings => validateContainer(settingsValue(settings, CONTAINER_IMAGE_KEY)),
    },
    [IMAGE_URL_KEY]: {
      id: 'provision-source-url',
      title: 'URL',
      required: true,
      isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_URL),
      disabled: userTemplate !== undefined,
      validate: settings => validateURL(settingsValue(settings, IMAGE_URL_KEY)),
    },
    ...providersSection,
    [OPERATING_SYSTEM_KEY]: {
      id: 'operating-system-dropdown',
      title: 'Operating System',
      type: DROPDOWN,
      defaultValue: '--- Select Operating System ---',
      choices: operatingSystems,
      required: true,
      disabled: userTemplate !== undefined,
      help: HELP_OS,
    },
    [FLAVOR_KEY]: {
      id: 'flavor-dropdown',
      title: 'Flavor',
      type: DROPDOWN,
      defaultValue: '--- Select Flavor ---',
      choices: flavors,
      required: true,
      disabled: userTemplate !== undefined && flavors.length === 1,
      help: HELP_FLAVOR,
    },
    [MEMORY_KEY]: {
      id: 'resources-memory',
      title: 'Memory (GB)',
      type: POSITIVE_NUMBER,
      required: true,
      isVisible: basicVmSettings => isFlavorType(basicVmSettings, CUSTOM_FLAVOR),
      help: HELP_MEMORY,
    },
    [CPU_KEY]: {
      id: 'resources-cpu',
      title: 'CPUs',
      type: POSITIVE_NUMBER,
      required: true,
      isVisible: basicVmSettings => isFlavorType(basicVmSettings, CUSTOM_FLAVOR),
      help: HELP_CPU,
    },
    [WORKLOAD_PROFILE_KEY]: {
      id: 'workload-profile-dropdown',
      title: 'Workload Profile',
      type: DROPDOWN,
      defaultValue: '--- Select Workload Profile ---',
      choices: workloadProfiles,
      required: true,
      help: HELP_WORKLOAD,
      disabled: userTemplate !== undefined,
    },
    [START_VM_KEY]: startVmCheckbox,
    [CLOUD_INIT_KEY]: {
      id: 'use-cloud-init',
      title: 'Use cloud-init',
      type: CHECKBOX,
    },
    [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
      id: 'use-cloud-init-custom-script',
      title: 'Use custom script',
      type: CHECKBOX,
      isVisible: basicVmSettings => settingsValue(basicVmSettings, CLOUD_INIT_KEY, false),
    },
    [HOST_NAME_KEY]: {
      id: 'cloud-init-hostname',
      title: 'Hostname',
      isVisible: basicVmSettings =>
        settingsValue(basicVmSettings, CLOUD_INIT_KEY, false) &&
        !settingsValue(basicVmSettings, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY, false),
    },
    [AUTHKEYS_KEY]: {
      id: 'cloud-init-ssh',
      title: 'Authenticated SSH Keys',
      type: TEXT_AREA,
      isVisible: basicVmSettings =>
        settingsValue(basicVmSettings, CLOUD_INIT_KEY, false) &&
        !settingsValue(basicVmSettings, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY, false),
    },
    [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
      id: 'cloud-init-custom-script',
      title: 'Custom Script',
      type: TEXT_AREA,
      className: 'kubevirt-create-vm-wizard__custom-cloud-script-textarea',
      isVisible: basicVmSettings =>
        settingsValue(basicVmSettings, CLOUD_INIT_KEY, false) &&
        settingsValue(basicVmSettings, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY, false),
    },
  };
};

const asValueObject = (value, validation) => ({
  value,
  validation,
});

// TODO: To avoid race conditions as the basicSettings tab is bound to the CreateVmWizard state at the render-time, it would
//  be better to retrieve basicSettings at the time of its actual use - to align behavior with the setState().
// The onChange() bellow should be called with just the diff, not whole copy of the stepData.
const publish = ({ basicSettings, templates, onChange, dataVolumes }, value, target, formValid, formFields) => {
  let newBasicSettings;
  if (target === BATCH_CHANGES_KEY) {
    // the "value" is an array of pairs { value, target }
    const difference = value.value.reduce((map, obj) => {
      map[obj.target] = { value: obj.value }; // validation will be set in a next step
      return map;
    }, {});
    newBasicSettings = {
      ...basicSettings,
      ...difference,
    };
    value.value.forEach(pair => {
      if (pair.target !== INTERMEDIARY_NETWORKS_TAB_KEY && pair.target !== INTERMEDIARY_STORAGE_TAB_KEY) {
        // set field validation
        newBasicSettings[pair.target].validation =
          pair.validation || getFieldValidation(formFields[pair.target], pair.value, newBasicSettings);
      }
    });
    formValid = validateForm(formFields, newBasicSettings);
  } else {
    newBasicSettings = {
      ...basicSettings,
      [target]: value,
    };

    if (target === USER_TEMPLATE_KEY) {
      if (value.value === NO_TEMPLATE) {
        newBasicSettings[target] = asValueObject(undefined);
      } else {
        const allTemplates = getTemplate(templates, TEMPLATE_TYPE_VM);
        if (allTemplates.length > 0) {
          const userTemplate = allTemplates.find(template => template.metadata.name === value.value);
          updateTemplateData(userTemplate, newBasicSettings, dataVolumes);
        }
      }
      formValid = validateForm(formFields, newBasicSettings);
    }
  }

  onChange(newBasicSettings, formValid);
};

const updateTemplateData = (userTemplate, newBasicSettings, dataVolumes) => {
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
    const cloudInitUserData = getCloudInitUserData(vm);
    if (cloudInitUserData) {
      newBasicSettings[CLOUD_INIT_KEY] = asValueObject(true);
      newBasicSettings[USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY] = asValueObject(true);
      newBasicSettings[CLOUD_INIT_CUSTOM_SCRIPT_KEY] = asValueObject(cloudInitUserData || '');
    } else if (get(newBasicSettings[CLOUD_INIT_KEY], 'value')) {
      newBasicSettings[CLOUD_INIT_KEY] = asValueObject(false);
      newBasicSettings[USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY] = asValueObject(false);
    }

    // update provision source
    const provisionSource = getTemplateProvisionSource(userTemplate, dataVolumes);
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

// Do clean-up
export const onCloseBasic = async (basicSettings, callerContext) => {
  const v2vvmwareName = getV2VVmwareName(basicSettings);
  if (v2vvmwareName) {
    // This is a friendly help to keep things clean.
    // If missed here (e.g. when the browser window is closed), the kubevirt-vmware controller's garbage
    // collector will do following automatically after a delay.
    const resource = {
      metadata: {
        name: v2vvmwareName,
        // TODO: potential issue if the user changed the namespace after creation of the v2vvmware object
        // to fix: either store the namespace along the v2vvmwareName or empty v2vvmwareName on namespace change
        namespace: settingsValue(basicSettings, NAMESPACE_KEY),
      },
    };
    try {
      await callerContext.k8sKill(V2VVMwareModel, resource);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(
        'Failed to remove temporary V2VVMWare object. It is not an issue, it will be garbage collected later if still present, resource: ',
        resource,
        ', error: ',
        error
      );
    }
  }
};

export class BasicSettingsTab extends React.Component {
  constructor(props) {
    super(props);
    if (props.selectedNamespace) {
      this.updateSelectedNamespace(props);
    }
  }

  componentDidUpdate(prevProps) {
    const newNamespace = this.props.selectedNamespace;
    const oldNamespace = prevProps.selectedNamespace;

    if (getName(newNamespace) !== getName(oldNamespace)) {
      this.updateSelectedNamespace(this.props);
    }
  }

  updateSelectedNamespace = props => {
    const {
      basicSettings,
      namespaces,
      selectedNamespace,
      templates,
      createTemplate,
      WithResources,
      k8sCreate,
      k8sGet,
      k8sPatch,
    } = props;
    const formFields = getFormFields(
      basicSettings,
      namespaces,
      templates,
      selectedNamespace,
      createTemplate,
      WithResources,
      k8sCreate,
      k8sGet,
      k8sPatch
    );
    const valid = validateForm(formFields, basicSettings);
    publish(props, asValueObject(getName(selectedNamespace)), NAMESPACE_KEY, valid, formFields);
  };

  render() {
    const {
      basicSettings,
      namespaces,
      templates,
      selectedNamespace,
      createTemplate,
      WithResources,
      k8sCreate,
      k8sGet,
      k8sPatch,
    } = this.props;
    const formFields = getFormFields(
      basicSettings,
      namespaces,
      templates,
      selectedNamespace,
      createTemplate,
      WithResources,
      k8sCreate,
      k8sGet,
      k8sPatch
    );

    return (
      <FormFactory
        fields={formFields}
        fieldsValues={basicSettings}
        onFormChange={(newValue, target, formValid) => publish(this.props, newValue, target, formValid, formFields)}
      />
    );
  }
}

BasicSettingsTab.defaultProps = {
  selectedNamespace: undefined,
  createTemplate: false,
};

BasicSettingsTab.propTypes = {
  WithResources: PropTypes.func.isRequired,
  k8sCreate: PropTypes.func.isRequired,
  k8sGet: PropTypes.func.isRequired,
  k8sPatch: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  namespaces: PropTypes.array.isRequired,
  selectedNamespace: PropTypes.object, // used only in initialization
  basicSettings: PropTypes.object.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onChange: PropTypes.func.isRequired,
  createTemplate: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  dataVolumes: PropTypes.array.isRequired,
};

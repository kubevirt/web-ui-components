import { OrderedMap, OrderedSet } from 'immutable';

import {
  PROVISION_SOURCE_CLONED_DISK,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_URL,
} from '../../../../../constants';

import {
  AUTHKEYS_KEY,
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CONTAINER_IMAGE_KEY,
  CPU_KEY,
  DESCRIPTION_KEY,
  FLAVOR_KEY,
  HOST_NAME_KEY,
  IMAGE_URL_KEY,
  MEMORY_KEY,
  NAME_KEY,
  NAMESPACE_KEY,
  OPERATING_SYSTEM_KEY,
  PROVIDER_KEY,
  PROVIDERS_DATA_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  START_VM_KEY,
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  USE_CLOUD_INIT_KEY,
  USER_TEMPLATE_KEY,
  WORKLOAD_PROFILE_KEY,
} from '../../constants';

import { getProvisionSourceHelp, HELP_CPU, HELP_FLAVOR, HELP_MEMORY, HELP_OS, HELP_WORKLOAD } from '../../strings';

import { getProviders, getProviderInitialState } from '../../providers/definition';
import { getProviderHelp } from '../../providers/help';

import { asHidden, asRequired } from '../../utils/vmSettingsTabUtils';

export const getFieldId = key => idResolver[key];
export const getFieldTitle = key => titleResolver[key];
export const getDefaultValue = key => defaultValueResolver[key] || '';
export const getFieldHelp = (key, value) => {
  const resolveFunction = helpResolver[key];
  return resolveFunction ? resolveFunction(value) : null;
};

export const getVmSettingsInitialState = props => ({
  value: getInitialVmSettings(props),
  valid: false,
});

export const getInitialVmSettings = (props = { createTemplate: false }) => {
  const { createTemplate } = props;

  const provisionSources = [
    PROVISION_SOURCE_PXE,
    PROVISION_SOURCE_URL,
    PROVISION_SOURCE_CONTAINER,
    PROVISION_SOURCE_CLONED_DISK,
  ];

  const importProviders = createTemplate ? [] : getProviders();

  if (!createTemplate) {
    provisionSources.push(PROVISION_SOURCE_IMPORT);
  }

  return {
    [NAME_KEY]: {
      isRequired: asRequired(true),
    },
    [DESCRIPTION_KEY]: {},
    [NAMESPACE_KEY]: {
      isRequired: asRequired(true),
    },
    [USER_TEMPLATE_KEY]: {
      isHidden: asHidden(createTemplate, 'CREATE_TEMPLATE'),
    },
    [PROVISION_SOURCE_TYPE_KEY]: {
      isRequired: asRequired(true),
      sources: OrderedSet(provisionSources),
    },
    [PROVIDER_KEY]: {
      providers: importProviders,
    },
    [CONTAINER_IMAGE_KEY]: {},
    [IMAGE_URL_KEY]: {},
    [OPERATING_SYSTEM_KEY]: {
      isRequired: asRequired(true),
      operatingSystems: OrderedMap(),
    },
    [FLAVOR_KEY]: {
      isRequired: asRequired(true),
      flavors: OrderedSet(),
    },
    [MEMORY_KEY]: {},
    [CPU_KEY]: {},
    [WORKLOAD_PROFILE_KEY]: {
      isRequired: asRequired(true),
      workloadProfiles: OrderedSet(),
    },
    [START_VM_KEY]: {
      isHidden: asHidden(createTemplate, 'CREATE_TEMPLATE'),
    },
    [USE_CLOUD_INIT_KEY]: {},
    [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {},
    [HOST_NAME_KEY]: {},
    [AUTHKEYS_KEY]: {},
    [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {},
    [PROVIDERS_DATA_KEY]: {
      ...importProviders.reduce((allProviders, provider) => {
        allProviders[provider] = getProviderInitialState(provider, props);
        return allProviders;
      }, {}),
    },
  };
};

const titleResolver = {
  [NAME_KEY]: 'Name',
  [DESCRIPTION_KEY]: 'Description',
  [NAMESPACE_KEY]: 'Namespace',
  [USER_TEMPLATE_KEY]: 'Template',
  [PROVISION_SOURCE_TYPE_KEY]: 'Provision Source',
  [PROVIDER_KEY]: 'Provider',
  [CONTAINER_IMAGE_KEY]: 'Container Image',
  [IMAGE_URL_KEY]: 'URL',
  [OPERATING_SYSTEM_KEY]: 'Operating System',
  [FLAVOR_KEY]: 'Flavor',
  [MEMORY_KEY]: 'Memory (GB)',
  [CPU_KEY]: 'CPUs',
  [WORKLOAD_PROFILE_KEY]: 'Workload Profile',
  [START_VM_KEY]: 'Start virtual machine on creation',
  [USE_CLOUD_INIT_KEY]: 'Use cloud-init',
  [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: 'Use custom script',
  [HOST_NAME_KEY]: 'Hostname',
  [AUTHKEYS_KEY]: 'Authenticated SSH Keys',
  [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: 'Custom Script',
};

const idResolver = {
  [NAME_KEY]: 'vm-name',
  [DESCRIPTION_KEY]: 'vm-description',
  [NAMESPACE_KEY]: 'namespace-dropdown',
  [USER_TEMPLATE_KEY]: 'template-dropdown',
  [PROVISION_SOURCE_TYPE_KEY]: 'image-source-type-dropdown',
  [PROVIDER_KEY]: 'provider-dropdown',
  [CONTAINER_IMAGE_KEY]: 'provision-source-container',
  [IMAGE_URL_KEY]: 'provision-source-url',
  [OPERATING_SYSTEM_KEY]: 'operating-system-dropdown',
  [FLAVOR_KEY]: 'flavor-dropdown',
  [MEMORY_KEY]: 'resources-memory',
  [CPU_KEY]: 'resources-cpu',
  [WORKLOAD_PROFILE_KEY]: 'workload-profile-dropdown',
  [START_VM_KEY]: 'start-vm',
  [USE_CLOUD_INIT_KEY]: 'use-cloud-init',
  [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: 'use-cloud-init-custom-script',
  [HOST_NAME_KEY]: 'cloud-init-hostname',
  [AUTHKEYS_KEY]: 'cloud-init-ssh',
  [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: 'cloud-init-custom-script',
};

const defaultValueResolver = {
  [NAMESPACE_KEY]: '--- Select Namespace ---',
  [USER_TEMPLATE_KEY]: '--- Select Template ---',
  [PROVISION_SOURCE_TYPE_KEY]: '--- Select Provision Source ---',
  [PROVIDER_KEY]: '--- Select Provider ---',
  [OPERATING_SYSTEM_KEY]: '--- Select Operating System ---',
  [FLAVOR_KEY]: '--- Select Flavor ---',
  [WORKLOAD_PROFILE_KEY]: '--- Select Workload Profile ---',
};

const helpResolver = {
  [PROVISION_SOURCE_TYPE_KEY]: getProvisionSourceHelp,
  [PROVIDER_KEY]: getProviderHelp,
  [OPERATING_SYSTEM_KEY]: () => HELP_OS,
  [FLAVOR_KEY]: () => HELP_FLAVOR,
  [MEMORY_KEY]: () => HELP_MEMORY,
  [CPU_KEY]: () => HELP_CPU,
  [WORKLOAD_PROFILE_KEY]: () => HELP_WORKLOAD,
};

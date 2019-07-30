import { get, isEqual } from 'lodash';

import { getProviders, getProviderStateUpdater } from '../providers';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_URL,
  TEMPLATE_TYPE_VM,
} from '../../../../constants';
import {
  selectVm,
  getFlavors,
  getOperatingSystems,
  getTemplateFlavors,
  getTemplateOperatingSystems,
  getTemplateWorkloadProfiles,
  getWorkloadProfiles,
} from '../../../../k8s/selectors';
import { getCloudInitUserData, getCpu, getMemory, getName } from '../../../../selectors';
import { objectMerge } from '../../../../utils/utils';
import { getTemplateProvisionSource, getTemplate } from '../../../../utils';

import {
  AUTHKEYS_KEY,
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CONTAINER_IMAGE_KEY,
  CPU_KEY,
  FLAVOR_KEY,
  HOST_NAME_KEY,
  IMAGE_URL_KEY,
  MEMORY_KEY,
  NAMESPACE_KEY,
  OPERATING_SYSTEM_KEY,
  PROVIDER_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  START_VM_KEY,
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  USE_CLOUD_INIT_KEY,
  USER_TEMPLATE_KEY,
  VM_SETTINGS_TAB_KEY,
  WORKLOAD_PROFILE_KEY,
} from '../constants';
import {
  asDisabled,
  asHidden,
  asRequired,
  asValueObject,
  hasVmSettingsChanged,
  getVmSettingAttribute,
  getVmSettingValue,
  didPropChange,
} from '../utils/vmSettingsTabUtils';

// TODO: rather manage with immutable/redux/saga
export const getVmSettingsTabStateUpdate = (prevProps, prevState, props, state, extra) =>
  [
    ...getProviders().map(provider => getProviderStateUpdater(provider)),
    ...[
      selectedNamespaceUpdateCreator,
      useCloudInitUpdateCreator,
      useCloudInitCustomScriptUpdateCreator,
      selectedUserTemplateUpdateCreator,
      provisioningSourceUpdateCreator,
      providerUpdateCreator,
      userTemplateUpdateCreator,
      templatesDataUpdateCreator,
      flavorUpdateCreator,
    ].map(creator => vmSettingsCreator(creator)),
  ].reduce((intermediaryState, updater) => {
    const update = updater && updater(prevProps, prevState, props, intermediaryState, extra);
    return update && update !== intermediaryState ? objectMerge({}, intermediaryState, update) : intermediaryState;
  }, state);

export const vmSettingsCreator = updateCreator => (...args) => {
  const update = updateCreator(...args);
  return (
    update && {
      stepData: {
        [VM_SETTINGS_TAB_KEY]: {
          value: update,
        },
      },
    }
  );
};

export const selectedNamespaceUpdateCreator = (prevProps, prevState, props, state) => {
  if (!didPropChange(prevProps, props, 'selectedNamespace', getName)) {
    return null;
  }

  const selectedNamespaceName = getName(props.selectedNamespace);
  const hasNamespace = !!selectedNamespaceName;

  return {
    [NAMESPACE_KEY]: {
      value: hasNamespace ? selectedNamespaceName : undefined,
      isHidden: asHidden(hasNamespace, 'SELECTED_NAMESPACE'),
    },
  };
};

export const flavorUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmSettingsChanged(prevState, state, FLAVOR_KEY)) {
    return null;
  }
  const flavor = getVmSettingValue(state, FLAVOR_KEY);
  const flavors = getVmSettingAttribute(state, FLAVOR_KEY, 'flavors', []);

  const isHidden = asHidden(flavor !== CUSTOM_FLAVOR, FLAVOR_KEY);
  const isRequired = asRequired(flavor === CUSTOM_FLAVOR, FLAVOR_KEY);

  const update = {
    [MEMORY_KEY]: {
      isHidden,
      isRequired,
    },
    [CPU_KEY]: {
      isHidden,
      isRequired,
    },
    [FLAVOR_KEY]: {
      isDisabled: asDisabled(flavors.length <= 1),
    },
  };

  if (props.templatesLoaded && flavors.length === 1) {
    const [firstFlavor] = flavors;
    update[FLAVOR_KEY].value = firstFlavor;
  }
  return update;
};

export const provisioningSourceUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmSettingsChanged(prevState, state, PROVISION_SOURCE_TYPE_KEY)) {
    return null;
  }
  const source = getVmSettingValue(state, PROVISION_SOURCE_TYPE_KEY);
  const isContainer = source === PROVISION_SOURCE_CONTAINER;
  const isUrl = source === PROVISION_SOURCE_URL;
  const isImport = source === PROVISION_SOURCE_IMPORT;

  return {
    [CONTAINER_IMAGE_KEY]: {
      value: isUrl ? null : undefined,
      isRequired: asRequired(isContainer, PROVISION_SOURCE_TYPE_KEY),
      isHidden: asHidden(!isContainer, PROVISION_SOURCE_TYPE_KEY),
    },
    [IMAGE_URL_KEY]: {
      value: isContainer ? null : undefined,
      isRequired: asRequired(isUrl, PROVISION_SOURCE_TYPE_KEY),
      isHidden: asHidden(!isUrl, PROVISION_SOURCE_TYPE_KEY),
    },
    [PROVIDER_KEY]: {
      value: isImport ? undefined : null,
      isRequired: asRequired(isImport, PROVISION_SOURCE_TYPE_KEY),
      isHidden: asHidden(!isImport, PROVISION_SOURCE_TYPE_KEY),
    },
    [USER_TEMPLATE_KEY]: {
      value: isImport ? null : undefined,
      isHidden: asHidden(isImport, PROVISION_SOURCE_TYPE_KEY),
    },
    [START_VM_KEY]: {
      value: isImport ? false : undefined,
      isHidden: asHidden(isImport, PROVISION_SOURCE_TYPE_KEY),
    },
  };
};

const providerUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmSettingsChanged(prevState, state, PROVISION_SOURCE_TYPE_KEY, NAMESPACE_KEY)) {
    return null;
  }

  const isDisabled =
    getVmSettingValue(state, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_IMPORT &&
    !getVmSettingValue(state, NAMESPACE_KEY);

  return {
    [PROVIDER_KEY]: {
      isDisabled: asDisabled(isDisabled, PROVIDER_KEY),
    },
  };
};

export const userTemplateUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmSettingsChanged(prevState, state, USER_TEMPLATE_KEY)) {
    return null;
  }

  const userTemplate = getVmSettingValue(state, USER_TEMPLATE_KEY);

  const isDisabled = asDisabled(userTemplate != null, USER_TEMPLATE_KEY);
  return {
    [PROVISION_SOURCE_TYPE_KEY]: { isDisabled },
    [CONTAINER_IMAGE_KEY]: { isDisabled },
    [IMAGE_URL_KEY]: { isDisabled },
    [OPERATING_SYSTEM_KEY]: { isDisabled },
    [WORKLOAD_PROFILE_KEY]: { isDisabled },
  };
};

export const useCloudInitUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmSettingsChanged(prevState, state, USE_CLOUD_INIT_KEY)) {
    return null;
  }

  const useCloudInit = getVmSettingValue(state, USE_CLOUD_INIT_KEY);
  const isHidden = asHidden(!useCloudInit, USE_CLOUD_INIT_KEY);
  const resetValue = !useCloudInit ? null : undefined;
  return {
    [USE_CLOUD_INIT_KEY]: { value: useCloudInit },
    [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: { isHidden, value: !useCloudInit ? false : undefined },
    [HOST_NAME_KEY]: { isHidden, value: resetValue },
    [AUTHKEYS_KEY]: { isHidden, value: resetValue },
    [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: { isHidden, value: resetValue },
  };
};

export const useCloudInitCustomScriptUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmSettingsChanged(prevState, state, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY)) {
    return null;
  }

  const useCloudInitCustomScript = getVmSettingValue(state, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY);
  const isHidden = asHidden(useCloudInitCustomScript, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY);
  const resetValue = useCloudInitCustomScript ? null : undefined;
  return {
    [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: { value: useCloudInitCustomScript },
    [HOST_NAME_KEY]: { isHidden, value: resetValue },
    [AUTHKEYS_KEY]: { isHidden, value: resetValue },
    [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
      isHidden: asHidden(!useCloudInitCustomScript, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY),
      value: !useCloudInitCustomScript ? null : undefined,
    },
  };
};

export const templatesDataUpdateCreator = (prevProps, prevState, props, state) => {
  if (
    !(
      hasVmSettingsChanged(
        prevState,
        state,
        USER_TEMPLATE_KEY,
        FLAVOR_KEY,
        WORKLOAD_PROFILE_KEY,
        OPERATING_SYSTEM_KEY
      ) ||
      // leaks a lot of updates
      get(prevProps, 'templates') !== get(props, 'templates')
    )
  ) {
    return null;
  }

  const { templates } = props;
  const params = {
    userTemplate: getVmSettingValue(state, USER_TEMPLATE_KEY),
    flavor: getVmSettingValue(state, FLAVOR_KEY),
    workload: getVmSettingValue(state, WORKLOAD_PROFILE_KEY),
    os: getVmSettingValue(state, OPERATING_SYSTEM_KEY),
  };

  const update = {
    [FLAVOR_KEY]: {
      flavors: getFlavors(params, templates),
      isDisabled: asDisabled(!props.templatesLoaded, 'templatesLoaded'),
    },
    [OPERATING_SYSTEM_KEY]: {
      operatingSystems: getOperatingSystems(params, templates),
      isDisabled: asDisabled(!props.templatesLoaded, 'templatesLoaded'),
    },
    [WORKLOAD_PROFILE_KEY]: {
      workloadProfiles: getWorkloadProfiles(params, templates),
      isDisabled: asDisabled(!props.templatesLoaded, 'templatesLoaded'),
    },
  };

  const oldUpdate = {
    [FLAVOR_KEY]: { flavors: getVmSettingAttribute(state, FLAVOR_KEY, 'flavors') },
    [OPERATING_SYSTEM_KEY]: {
      operatingSystems: getVmSettingAttribute(state, OPERATING_SYSTEM_KEY, 'operatingSystems'),
    },
    [WORKLOAD_PROFILE_KEY]: {
      workloadProfiles: getVmSettingAttribute(state, WORKLOAD_PROFILE_KEY, 'workloadProfiles'),
    },
  };

  // compare if we got any update from templates
  if (isEqual(update, oldUpdate)) {
    return null;
  }

  return update;
};

// used by user template; currently we do not support PROVISION_SOURCE_IMPORT
const provisionSourceDataFieldResolver = {
  [PROVISION_SOURCE_CONTAINER]: CONTAINER_IMAGE_KEY,
  [PROVISION_SOURCE_URL]: IMAGE_URL_KEY,
};

export const selectedUserTemplateUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmSettingsChanged(prevState, state, USER_TEMPLATE_KEY)) {
    return null;
  }
  const { templates, dataVolumes } = props;

  const allTemplates = getTemplate(templates, TEMPLATE_TYPE_VM);
  const userTemplateName = getVmSettingValue(state, USER_TEMPLATE_KEY);
  const userTemplate = allTemplates.find(template => template.metadata.name === userTemplateName);
  const update = {};

  if (!userTemplate) {
    return update;
  }

  const vm = selectVm(userTemplate.objects);

  // update flavor
  const [flavor] = getTemplateFlavors([userTemplate]);
  update[FLAVOR_KEY] = asValueObject(flavor);
  if (flavor === CUSTOM_FLAVOR) {
    update.cpu = asValueObject(getCpu(vm));
    const memory = getMemory(vm);
    update.memory = memory ? asValueObject(parseInt(memory, 10)) : null;
  }

  // update os
  const [os] = getTemplateOperatingSystems([userTemplate]);
  update[OPERATING_SYSTEM_KEY] = asValueObject(os);

  // update workload profile
  const [workload] = getTemplateWorkloadProfiles([userTemplate]);
  update[WORKLOAD_PROFILE_KEY] = asValueObject(workload);

  // update cloud-init
  const cloudInitUserData = getCloudInitUserData(vm);
  if (cloudInitUserData) {
    update[USE_CLOUD_INIT_KEY] = asValueObject(true);
    update[USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY] = asValueObject(true);
    update[CLOUD_INIT_CUSTOM_SCRIPT_KEY] = asValueObject(cloudInitUserData || '');
  } else if (get(update[USE_CLOUD_INIT_KEY], 'value')) {
    update[USE_CLOUD_INIT_KEY] = asValueObject(false);
    update[USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY] = asValueObject(false);
  }

  // update provision source
  const provisionSource = getTemplateProvisionSource(userTemplate, dataVolumes);
  update[PROVISION_SOURCE_TYPE_KEY] = asValueObject(
    provisionSource && !provisionSource.error ? provisionSource.type : null
  );
  if (provisionSource && !provisionSource.error) {
    const dataFieldName = provisionSourceDataFieldResolver[provisionSource.type];
    if (dataFieldName) {
      update[dataFieldName] = asValueObject(provisionSource.source);
    }
  }

  return update;
};

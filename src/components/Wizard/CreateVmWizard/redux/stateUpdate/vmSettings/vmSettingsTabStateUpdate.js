import { OrderedSet, OrderedMap } from 'immutable';

import { getProviders, getProviderStateUpdater } from '../../../providers';
import {
  CUSTOM_FLAVOR,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_IMPORT,
  PROVISION_SOURCE_URL,
} from '../../../../../../constants';
import { getFlavors, getOperatingSystems, getWorkloadProfiles } from '../../../../../../k8s/selectors';
import { getName } from '../../../../../../selectors';

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
  WORKLOAD_PROFILE_KEY,
} from '../../../constants';
import {
  asDisabled,
  asHidden,
  asRequired,
  hasVmSettingsChanged,
  getVmSettingAttribute,
  getVmSettingValue,
} from '../../../utils/vmSettingsTabUtils';
import { vmWizardInternalActions, internalTypes, vmWizardActions, types } from '../../actions';
import { immutableListToShallowJS, concatImmutableLists } from '../../../../../../utils/immutable';
import { getStorages } from '../../../utils/storageTabUtils';
import { getInitialDisk } from '../../initialState/storageTabInitialState';
import { prefillVmTemplateUpdater } from './prefillVmTemplateStateUpdate';

export const updateVmSettingsState = options =>
  [
    ...getProviders().map(provider => getProviderStateUpdater(provider)),

    selectedNamespaceUpdater,
    selectedUserTemplateUpdater,
    useCloudInitUpdater,
    useCloudInitCustomScriptUpdater,
    provisioningSourceUpdater,
    prefillInitialDiskUpdater,
    providerUpdater,
    templatesDataUpdater,
    flavorUpdater,
  ].forEach(updater => {
    updater && updater(options);
  });

export const selectedNamespaceUpdater = ({ id, props, prevState, changedProps, dispatch }) => {
  if (!changedProps.selectedNamespace) {
    return;
  }

  const selectedNamespaceName = getName(props.selectedNamespace);
  const hasNamespace = !!selectedNamespaceName;

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsFieldInternal](id, NAMESPACE_KEY, {
      value: hasNamespace ? selectedNamespaceName : undefined,
      isHidden: asHidden(hasNamespace, 'SELECTED_NAMESPACE'),
    })
  );
};

export const selectedUserTemplateUpdater = options => {
  const { id, props, prevState, dispatch, getState } = options;
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, USER_TEMPLATE_KEY)) {
    return;
  }
  const { userTemplates } = props;

  const userTemplateName = getVmSettingValue(state, id, USER_TEMPLATE_KEY);
  const userTemplateImmutable =
    userTemplateName && userTemplates ? userTemplates.find(template => getName(template) === userTemplateName) : null;

  const isDisabled = asDisabled(userTemplateImmutable != null, USER_TEMPLATE_KEY);

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, {
      [PROVISION_SOURCE_TYPE_KEY]: { isDisabled },
      [CONTAINER_IMAGE_KEY]: { isDisabled },
      [IMAGE_URL_KEY]: { isDisabled },
      [OPERATING_SYSTEM_KEY]: { isDisabled },
      [WORKLOAD_PROFILE_KEY]: { isDisabled },
    })
  );

  prefillVmTemplateUpdater(options);
};

export const useCloudInitUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, USE_CLOUD_INIT_KEY)) {
    return;
  }

  const useCloudInit = getVmSettingValue(state, id, USE_CLOUD_INIT_KEY);
  const isHidden = asHidden(!useCloudInit, USE_CLOUD_INIT_KEY);
  const resetValue = !useCloudInit ? null : undefined;

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, {
      [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: { isHidden, value: !useCloudInit ? false : undefined },
      [HOST_NAME_KEY]: { isHidden, value: resetValue },
      [AUTHKEYS_KEY]: { isHidden, value: resetValue },
      [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: { isHidden, value: resetValue },
    })
  );
};

export const useCloudInitCustomScriptUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY)) {
    return;
  }

  const useCloudInitCustomScript = getVmSettingValue(state, id, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY);
  const isHidden = asHidden(useCloudInitCustomScript, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY);
  const resetValue = useCloudInitCustomScript ? null : undefined;

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, {
      [HOST_NAME_KEY]: { isHidden, value: resetValue },
      [AUTHKEYS_KEY]: { isHidden, value: resetValue },
      [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
        isHidden: asHidden(!useCloudInitCustomScript, USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY),
        value: !useCloudInitCustomScript ? null : undefined,
      },
    })
  );
};

export const provisioningSourceUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, PROVISION_SOURCE_TYPE_KEY, USER_TEMPLATE_KEY)) {
    return;
  }
  const source = getVmSettingValue(state, id, PROVISION_SOURCE_TYPE_KEY);
  const isContainer = source === PROVISION_SOURCE_CONTAINER;
  const isUrl = source === PROVISION_SOURCE_URL;
  const isImport = source === PROVISION_SOURCE_IMPORT;

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, {
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
        // value must be null if PROVISION_SOURCE_IMPORT is selected
        isHidden: asHidden(isImport, PROVISION_SOURCE_TYPE_KEY),
      },
      [START_VM_KEY]: {
        value: isImport ? false : undefined,
        isHidden: asHidden(isImport, PROVISION_SOURCE_TYPE_KEY),
      },
    })
  );
};

// TODO: move this logic to StorageTab?
export const prefillInitialDiskUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, PROVISION_SOURCE_TYPE_KEY, USER_TEMPLATE_KEY)) {
    return;
  }

  const storageRowsUpdate = immutableListToShallowJS(getStorages(state, id)).filter(
    storage => storage.templateStorage || !storage.rootStorage
  );
  // template pre-fills its own storages
  if (!getVmSettingValue(state, id, USER_TEMPLATE_KEY)) {
    const storage = getInitialDisk(getVmSettingValue(state, id, PROVISION_SOURCE_TYPE_KEY));
    if (storage) {
      storageRowsUpdate.push(storage);
    }
  }

  dispatch(vmWizardActions[types.setStorages](id, storageRowsUpdate));
};

const providerUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, PROVISION_SOURCE_TYPE_KEY, NAMESPACE_KEY)) {
    return;
  }

  const isDisabled =
    getVmSettingValue(state, id, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_IMPORT &&
    !getVmSettingValue(state, id, NAMESPACE_KEY);

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, {
      [PROVIDER_KEY]: {
        isDisabled: asDisabled(isDisabled, PROVIDER_KEY),
      },
    })
  );
};

export const templatesDataUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  if (
    !(
      hasVmSettingsChanged(
        prevState,
        state,
        id,
        USER_TEMPLATE_KEY,
        FLAVOR_KEY,
        WORKLOAD_PROFILE_KEY,
        OPERATING_SYSTEM_KEY
      ) ||
      changedProps.userTemplates ||
      changedProps.commonTemplates
    )
  ) {
    return;
  }

  const { userTemplates, commonTemplates } = props;
  const params = {
    userTemplate: getVmSettingValue(state, id, USER_TEMPLATE_KEY),
    flavor: getVmSettingValue(state, id, FLAVOR_KEY),
    workload: getVmSettingValue(state, id, WORKLOAD_PROFILE_KEY),
    os: getVmSettingValue(state, id, OPERATING_SYSTEM_KEY),
  };

  const vanillaTemplates = immutableListToShallowJS(concatImmutableLists(commonTemplates, userTemplates));

  dispatch(
    vmWizardInternalActions[internalTypes.setInVmSettingsBatchInternal](id, [
      {
        path: [FLAVOR_KEY, 'flavors'],
        value: OrderedSet(getFlavors(params, vanillaTemplates)),
      },
      {
        path: [OPERATING_SYSTEM_KEY, 'operatingSystems'],
        value: OrderedMap(getOperatingSystems(params, vanillaTemplates).map(os => [os.id, os])),
      },
      {
        path: [WORKLOAD_PROFILE_KEY, 'workloadProfiles'],
        value: OrderedSet(getWorkloadProfiles(params, vanillaTemplates)),
      },
    ])
  );
};

export const flavorUpdater = ({ id, props, prevState, changedProps, dispatch, getState }) => {
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, FLAVOR_KEY)) {
    return;
  }
  const flavor = getVmSettingValue(state, id, FLAVOR_KEY);
  const flavors = getVmSettingAttribute(state, id, FLAVOR_KEY, 'flavors');

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
      isDisabled: asDisabled(!flavors || flavors.size <= 1),
    },
  };

  if (flavors && flavors.size === 1) {
    update[FLAVOR_KEY].value = flavors.first();
  }

  dispatch(vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, update));
};

import {
  DESCRIPTION_KEY,
  FLAVOR_KEY,
  NAME_KEY,
  NAMESPACE_KEY,
  OPERATING_SYSTEM_KEY,
  PROVIDER_KEY,
  PROVIDERS_DATA_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  USE_CLOUD_INIT_KEY,
  WORKLOAD_PROFILE_KEY,
  MEMORY_KEY,
  CPU_KEY,
} from '../../../../constants';
import { startV2VVMWareController } from '../../../../../../../k8s/requests/v2v';
import { getName, get } from '../../../../../../../selectors';
import { EnhancedK8sMethods } from '../../../../../../../k8s/util';
import { cleanupAndGetResults, errorsFirstSort } from '../../../../../../../k8s/util/k8sMethodsUtils';
import {
  getVmwareAttribute,
  getVmwareField,
  getVmwareValue,
  hasVmWareSettingsChanged,
  hasVmWareSettingsValueChanged,
  isVmwareNewInstanceSecret,
  isVmwareProvider,
} from '../../../../providers/VMwareImportProvider/selectors';
import {
  asDisabled,
  asHidden,
  asRequired,
  getVmSettingValue,
  hasVmSettingsChanged,
  VMWARE_PROVIDER_METADATA_ID,
} from '../../../../utils/vmSettingsTabUtils';
import {
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_CHECK_CONNECTION_KEY,
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_V2V_NAME_KEY,
  PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY,
  PROVIDER_VMWARE_STATUS_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PASSWORD_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from '../../../../providers/VMwareImportProvider/constants';
import {
  createV2VvmwareObject,
  createV2VvmwareObjectWithSecret,
} from '../../../../../../../k8s/requests/v2v/createV2VvmwareObject';
import { requestVmDetail } from '../../../../../../../k8s/requests/v2v/requestVmDetail';
import { prefillUpdateCreator } from './prefillVmStateUpdate';
import { getSimpleV2vVMwareStatus } from '../../../../../../../utils/status/v2vVMware/v2vVMwareStatus';
import {
  V2V_WMWARE_STATUS_ALL_OK,
  V2V_WMWARE_STATUS_LOADING_VM_DETAIL_FAILED,
  V2V_WMWARE_STATUS_UNKNOWN,
} from '../../../../../../../utils/status/v2vVMware';
import { internalTypes, vmWizardInternalActions } from '../../../actions';
import { getLoadedVm, getThumbprint } from '../../../../../../../selectors/v2v';
import { deleteV2VvmwareObject } from '../../../../../../../k8s/requests/v2v/deleteV2VvmwareObject';

const { info, warn, error } = console;

export const getVmwareProviderStateUpdate = options =>
  [
    startControllerAndCleanup,
    v2vVmWareUpdater,
    providerUpdater,
    secretUpdater,
    secretValueUpdater,
    checkConnectiondUpdater,
    vmChangedUpdater,
  ].forEach(updater => {
    updater && updater(options);
  });

export const startControllerAndCleanup = options => {
  const { id, props, prevState, getState } = options;
  const state = getState();
  if (!hasVmSettingsChanged(prevState, state, id, PROVISION_SOURCE_TYPE_KEY, PROVIDER_KEY, NAMESPACE_KEY)) {
    return;
  }

  const namespace = getVmSettingValue(state, id, NAMESPACE_KEY);

  if (isVmwareProvider(state, id) && namespace) {
    startV2VVMWareControllerWithCleanup(options, { namespace }); // fire side effect
  }

  if (isVmwareProvider(prevState, id)) {
    deleteV2VvmwareObject(
      {
        name: getVmwareField(prevState, id, PROVIDER_VMWARE_V2V_NAME_KEY),
        namespace: getVmSettingValue(prevState, id, NAMESPACE_KEY),
      },
      props
    );
  }
};

export const v2vVmWareUpdater = options => {
  const { id, props, prevState, changedProps, dispatch, getState } = options;
  const state = getState();

  if (!changedProps.v2vvmware && !changedProps.vmwareToKubevirtOsConfigMap) {
    return;
  }

  const { v2vvmware } = props;

  const selectedVmName = getVmwareValue(state, id, PROVIDER_VMWARE_VM_KEY);
  const vm = getLoadedVm(v2vvmware, selectedVmName);

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, {
      [PROVIDER_VMWARE_VM_KEY]: {
        isDisabled: asDisabled(!v2vvmware, PROVIDER_VMWARE_VM_KEY),
        // data for request
        vm: selectedVmName && !vm ? undefined : vm, // moving across tabs resets listening for v2vvmware
        thumbprint: getThumbprint(v2vvmware),
      },
      [PROVIDER_VMWARE_STATUS_KEY]: {
        value: getSimpleV2vVMwareStatus(v2vvmware),
      },
    })
  );

  const prevVm = getVmwareAttribute(prevState, id, PROVIDER_VMWARE_VM_KEY, 'vm');
  const prevLoadedVmName = get(prevVm, 'name');
  const loadedVmName = get(vm, 'name');

  if (!vm || prevLoadedVmName === loadedVmName || loadedVmName !== selectedVmName) {
    return;
  }

  prefillUpdateCreator(options);
};

export const providerUpdater = options => {
  const { id, prevState, dispatch, getState } = options;
  const state = getState();
  if (
    !hasVmSettingsChanged(prevState, state, id, PROVISION_SOURCE_TYPE_KEY, PROVIDER_KEY, NAMESPACE_KEY) &&
    !hasVmWareSettingsChanged(prevState, state, id, PROVIDER_VMWARE_STATUS_KEY, PROVIDER_VMWARE_VM_KEY)
  ) {
    return;
  }

  const namespace = getVmSettingValue(state, id, NAMESPACE_KEY);
  const loadedVm = getVmwareAttribute(state, id, PROVIDER_VMWARE_VM_KEY, 'vm');
  const status = getVmwareValue(state, id, PROVIDER_VMWARE_STATUS_KEY);

  const hasLoadedVm = !!loadedVm;
  const isVmWareProvider = isVmwareProvider(state, id);
  const isOkStatus = V2V_WMWARE_STATUS_ALL_OK.includes(status);

  const hiddenMetadata = {
    isHidden: asHidden(!namespace || !isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
  };

  const requiredMetadata = {
    ...hiddenMetadata,
    isRequired: asRequired(isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
  };

  const isEditingDisabled = isVmWareProvider && !(hasLoadedVm && isOkStatus);
  const needsValuesReset = isVmWareProvider && !hasLoadedVm;

  const vmFieldUpdate = {
    isDisabled: asDisabled(isEditingDisabled, VMWARE_PROVIDER_METADATA_ID),
    value: needsValuesReset ? null : undefined,
  };

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, {
      [NAME_KEY]: vmFieldUpdate,
      [DESCRIPTION_KEY]: vmFieldUpdate,
      [OPERATING_SYSTEM_KEY]: vmFieldUpdate,
      [FLAVOR_KEY]: vmFieldUpdate,
      [MEMORY_KEY]: vmFieldUpdate,
      [CPU_KEY]: vmFieldUpdate,
      [WORKLOAD_PROFILE_KEY]: vmFieldUpdate,
      [USE_CLOUD_INIT_KEY]: {
        isDisabled: asDisabled(isEditingDisabled, VMWARE_PROVIDER_METADATA_ID),
        value: needsValuesReset ? false : undefined,
      },
      [PROVIDERS_DATA_KEY]: {
        [PROVIDER_VMWARE]: {
          [PROVIDER_VMWARE_VCENTER_KEY]: requiredMetadata,
          [PROVIDER_VMWARE_HOSTNAME_KEY]: hiddenMetadata,
          [PROVIDER_VMWARE_USER_NAME_KEY]: hiddenMetadata,
          [PROVIDER_VMWARE_USER_PASSWORD_KEY]: hiddenMetadata,
          [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: hiddenMetadata,
          [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: hiddenMetadata,
          [PROVIDER_VMWARE_VM_KEY]: {
            isHidden: asHidden(!namespace || !isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
            isRequired: asRequired(isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
            isDisabled: asDisabled(
              !isOkStatus && status !== V2V_WMWARE_STATUS_LOADING_VM_DETAIL_FAILED,
              VMWARE_PROVIDER_METADATA_ID
            ),
            value: !isVmWareProvider ? null : undefined,
            vm: !isVmWareProvider ? null : undefined,
            thumbprint: !isVmWareProvider ? null : undefined,
          },
          [PROVIDER_VMWARE_STATUS_KEY]: {
            isHidden: asHidden(
              !isVmWareProvider || [...V2V_WMWARE_STATUS_ALL_OK, V2V_WMWARE_STATUS_UNKNOWN].includes(status),
              VMWARE_PROVIDER_METADATA_ID
            ),
          },
        },
      },
    })
  );
};

export const secretUpdater = ({ id, prevState, dispatch, getState }) => {
  const state = getState();
  if (
    !hasVmWareSettingsChanged(
      prevState,
      state,
      id,
      PROVIDER_VMWARE_VCENTER_KEY,
      PROVIDER_VMWARE_HOSTNAME_KEY,
      PROVIDER_VMWARE_USER_NAME_KEY,
      PROVIDER_VMWARE_USER_PASSWORD_KEY
    )
  ) {
    return;
  }

  const isNewInstanceSecret = isVmwareNewInstanceSecret(state, id);

  const hasPrerequisiteValues =
    isNewInstanceSecret &&
    getVmwareValue(state, id, PROVIDER_VMWARE_HOSTNAME_KEY) &&
    getVmwareValue(state, id, PROVIDER_VMWARE_USER_NAME_KEY) &&
    getVmwareValue(state, id, PROVIDER_VMWARE_USER_PASSWORD_KEY);

  const hiddenMetadata = {
    isHidden: asHidden(!isNewInstanceSecret, PROVIDER_VMWARE_VCENTER_KEY),
  };

  const metadata = {
    ...hiddenMetadata,
    isRequired: asRequired(isNewInstanceSecret, PROVIDER_VMWARE_VCENTER_KEY),
  };

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, {
      [PROVIDER_VMWARE_HOSTNAME_KEY]: metadata,
      [PROVIDER_VMWARE_USER_NAME_KEY]: metadata,
      [PROVIDER_VMWARE_USER_PASSWORD_KEY]: metadata,
      [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: hiddenMetadata,
      [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: {
        ...hiddenMetadata,
        isDisabled: asDisabled(!hasPrerequisiteValues, PROVIDER_VMWARE_VCENTER_KEY),
      },
    })
  );
};

export const secretValueUpdater = options => {
  const { id, prevState, dispatch, getState } = options;
  const state = getState();
  if (!hasVmWareSettingsChanged(prevState, state, id, PROVIDER_VMWARE_VCENTER_KEY)) {
    return;
  }

  const connectionSecretName = getVmwareValue(state, id, PROVIDER_VMWARE_VCENTER_KEY);
  const isNewInstanceSecret = isVmwareNewInstanceSecret(state, id);

  if (isNewInstanceSecret || !connectionSecretName) {
    dispatch(
      vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, {
        [PROVIDER_VMWARE_V2V_NAME_KEY]: null,
      })
    );
  } else {
    // side effect
    createConnectionObjects(options, {
      namespace: getVmSettingValue(state, id, NAMESPACE_KEY),
      connectionSecretName,
      prevNamespace: getVmSettingValue(prevState, id, NAMESPACE_KEY),
      prevV2VName: getVmwareField(prevState, id, PROVIDER_VMWARE_V2V_NAME_KEY),
    });
  }
};

export const vmChangedUpdater = options => {
  const { id, prevState, getState } = options;
  const state = getState();
  if (!hasVmWareSettingsValueChanged(prevState, state, id, PROVIDER_VMWARE_VM_KEY)) {
    return;
  }

  const namespace = getVmSettingValue(state, id, NAMESPACE_KEY);
  const v2vwmwareName = getVmwareField(state, id, PROVIDER_VMWARE_V2V_NAME_KEY);
  const vmName = getVmwareValue(state, id, PROVIDER_VMWARE_VM_KEY);

  if (namespace && v2vwmwareName && vmName) {
    // TODO maybe fire from dropdown as an action ??
    requestVmDetails(options, {
      namespace,
      v2vwmwareName,
      vmName,
    }); // side effect
  }
};

export const checkConnectiondUpdater = options => {
  const { id, props, prevState, getState, dispatch } = options;
  const state = getState();
  const v2vwmwareName = getVmwareField(state, id, PROVIDER_VMWARE_V2V_NAME_KEY);

  // make another v2vvmware object if the user has already clicked on check or selected vcenter
  // and namespace changed after that - the user might not be aware that he needs to click on check connection again
  if (!v2vwmwareName || !hasVmSettingsChanged(prevState, state, id, NAMESPACE_KEY)) {
    return;
  }

  dispatch(getCheckConnectionAction(id, props, prevState));
};

// ACTIONS
// can be a standalone action because it does not need any followup handling or validation
export const getCheckConnectionAction = (id, props, prevState = null) => (dispatch, getState) => {
  const state = getState();

  const beforeMetadata = { isDisabled: asDisabled(true, PROVIDER_VMWARE_CHECK_CONNECTION_KEY) };
  const afterMetadata = { isDisabled: asDisabled(false, PROVIDER_VMWARE_CHECK_CONNECTION_KEY) };

  const namespace = getVmSettingValue(state, id, NAMESPACE_KEY);
  const url = getVmwareValue(state, id, PROVIDER_VMWARE_HOSTNAME_KEY);
  const username = getVmwareValue(state, id, PROVIDER_VMWARE_USER_NAME_KEY);
  const password = getVmwareValue(state, id, PROVIDER_VMWARE_USER_PASSWORD_KEY);

  if (!namespace || !url || !username || !password) {
    return;
  }

  // start connecting
  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, {
      [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: beforeMetadata,
      [PROVIDER_VMWARE_HOSTNAME_KEY]: beforeMetadata,
      [PROVIDER_VMWARE_USER_NAME_KEY]: beforeMetadata,
      [PROVIDER_VMWARE_USER_PASSWORD_KEY]: beforeMetadata,
      [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: beforeMetadata,
    })
  );

  // side effect
  // eslint-disable-next-line promise/catch-or-return
  createConnectionObjects(
    { id, props, dispatch, getState },
    {
      namespace,
      url,
      username,
      password,
      prevNamespace: getVmSettingValue(prevState || state, id, NAMESPACE_KEY),
      prevV2VName: getVmwareField(prevState || state, id, PROVIDER_VMWARE_V2V_NAME_KEY),
    }
  ).then(() =>
    dispatch(
      vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, {
        [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: afterMetadata,
        [PROVIDER_VMWARE_HOSTNAME_KEY]: afterMetadata,
        [PROVIDER_VMWARE_USER_NAME_KEY]: afterMetadata,
        [PROVIDER_VMWARE_USER_PASSWORD_KEY]: afterMetadata,
        [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: afterMetadata,
      })
    )
  );
};

const requestVmDetails = ({ props }, params) => {
  info('requesting vm detail');
  requestVmDetail(params, props).catch(reason => {
    // TODO: show in status?
    // eslint-disable-next-line no-console
    console.warn(
      'onVCenterVmSelectedConnected: Failed to patch the V2VVMWare object to query VM details: ',
      params,
      ', reason: ',
      reason
    );
  });
};

const createConnectionObjects = ({ id, props, dispatch }, params) => {
  const create = params.connectionSecretName ? createV2VvmwareObject : createV2VvmwareObjectWithSecret;
  const { prevNamespace, prevV2VName } = params;

  if (prevNamespace && prevV2VName) {
    const deleteParams = { name: prevV2VName, namespace: prevNamespace };
    info('destroying stale v2vvmware object ', deleteParams);
    deleteV2VvmwareObject(deleteParams, props);
  }

  info('creating v2vvmware object');
  return create(params, props)
    .then(v2vVmware =>
      dispatch(
        vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, {
          [PROVIDER_VMWARE_V2V_NAME_KEY]: getName(v2vVmware),
        })
      )
    )
    .catch(err => {
      warn('onVmwareCheckConnection(): Check for VMWare credentials failed, reason: ', err);
      dispatch(
        vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, {
          [PROVIDER_VMWARE_STATUS_KEY]: {
            // The CR can not be created
            isHidden: asHidden(false, VMWARE_PROVIDER_METADATA_ID),
            value: getSimpleV2vVMwareStatus(null, { hasConnectionFailed: true }),
          },
        })
      );
    });
};

const startV2VVMWareControllerWithCleanup = ({ props }, { namespace }) => {
  const enhancedK8sMethods = new EnhancedK8sMethods(props);

  return startV2VVMWareController({ namespace }, enhancedK8sMethods)
    .catch(e =>
      // eslint-disable-next-line promise/no-nesting
      cleanupAndGetResults(enhancedK8sMethods, e).then(({ results }) =>
        errorsFirstSort(results).forEach(o => warn(o.title, o.content))
      )
    )
    .catch(le => error(le));
};

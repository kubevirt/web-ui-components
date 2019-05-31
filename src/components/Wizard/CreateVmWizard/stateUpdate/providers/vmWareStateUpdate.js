import { get, has } from 'lodash';

import {
  VM_SETTINGS_TAB_KEY,
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
} from '../../constants';
import { objectMerge } from '../../../../../utils/utils';
import { startV2VVMWareController } from '../../../../../k8s/requests/v2v';
import { getName } from '../../../../../selectors';
import { EnhancedK8sMethods } from '../../../../../k8s/util';
import { cleanupAndGetResults, errorsFirstSort } from '../../../../../k8s/util/k8sMethodsUtils';
import {
  getVmwareAttribute,
  getVmwareField,
  getVmwareValue,
  hasVmWareSettingsChanged,
  hasVmWareSettingsValuesChanged,
  isVmwareNewInstanceSecret,
  isVmwareProvider,
} from '../../providers/VMwareImportProvider/selectors';
import {
  asDisabled,
  asHidden,
  asRequired,
  getVmSettingValue,
  hasVmSettingsChanged,
  VMWARE_PROVIDER_METADATA_ID,
} from '../../utils/vmSettingsTabUtils';
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
  PROVIDER_VMWARE_NEW_VCENTER_NAME_KEY,
  PROVIDER_VMWARE_CHECK_CONNECTION_BTN_TEXT_KEY,
  PROVIDER_VMWARE_CHECK_CONNECTION_BTN_SAVE,
  PROVIDER_VMWARE_CHECK_CONNECTION_BTN_DONT_SAVE,
} from '../../providers/VMwareImportProvider/constants';
import { vmSettingsCreator } from '../vmSettingsTabStateUpdate';
import {
  createV2VvmwareObject,
  createV2VvmwareObjectWithSecret,
} from '../../../../../k8s/requests/v2v/createV2VvmwareObject';
import { requestVmDetail } from '../../../../../k8s/requests/v2v/requestVmDetail';
import { prefilUpdateCreator } from './prefillVmStateUpdate';
import { getSimpleV2vVMwareStatus } from '../../../../../utils/status/v2vVMware/v2vVMwareStatus';
import {
  V2V_WMWARE_STATUS_ALL_OK,
  V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL,
  V2V_WMWARE_STATUS_UNKNOWN,
} from '../../../../../utils/status/v2vVMware';
import { addLabelToVmwareSecretPatch, removeLabelFromVmwareSecretPatch } from '../../../../../utils';
import { VCENTER_TEMPORARY_LABEL } from '../../../../../constants';
import { SecretModel } from '../../../../../models';
import { getVmwareConnectionName, getVmwareSecretLabels } from '../../../../../selectors/v2v';

const { info, warn, error } = console;

export const vmWareSettingsCreator = updateCreator => (...args) => {
  const update = updateCreator(...args);
  return (
    update && {
      stepData: {
        [VM_SETTINGS_TAB_KEY]: {
          value: {
            [PROVIDERS_DATA_KEY]: {
              [PROVIDER_VMWARE]: update,
            },
          },
        },
      },
    }
  );
};

export const getVmwareProviderStateUpdate = (prevProps, prevState, props, state, extra) =>
  [
    ...[providerUpdateCreator].map(creator => vmSettingsCreator(creator)),
    ...[
      secretUpdateCreator,
      secretValueUpdateCreator,
      saveSecretUpdateCreator,
      successfulConnectionUpdateCreator,
      checkConnectionUpdateCreator,
      vmwareNameChangedUpdateCreator,
      vmChangedUpdateCreator,
    ].map(creator => vmWareSettingsCreator(creator)),
    vmLoadedUpdateCreator,
  ].reduce((intermediaryState, updater) => {
    const update = updater && updater(prevProps, prevState, props, intermediaryState, extra);
    return update && update !== intermediaryState ? objectMerge({}, intermediaryState, update) : intermediaryState;
  }, state);

export const providerUpdateCreator = (prevProps, prevState, props, state) => {
  if (
    !(
      hasVmSettingsChanged(prevState, state, PROVISION_SOURCE_TYPE_KEY, PROVIDER_KEY, NAMESPACE_KEY) ||
      hasVmWareSettingsChanged(prevState, state, PROVIDER_VMWARE_STATUS_KEY, PROVIDER_VMWARE_VM_KEY)
    )
  ) {
    return null;
  }

  const namespace = getVmSettingValue(state, NAMESPACE_KEY);

  const loadedVm = getVmwareAttribute(state, PROVIDER_VMWARE_VM_KEY, 'vm');
  const status = getVmwareValue(state, PROVIDER_VMWARE_STATUS_KEY);

  const hasLoadedVm = !!loadedVm;
  const isVmWareProvider = isVmwareProvider(state);
  const isOkStatus = V2V_WMWARE_STATUS_ALL_OK.includes(status);

  const hiddenMetadata = {
    isHidden: asHidden(!isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
    isDisabled: asDisabled(!namespace, VMWARE_PROVIDER_METADATA_ID),
  };

  const requiredMetadata = {
    ...hiddenMetadata,
    isRequired: asRequired(isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
  };

  const isEditingDisabled = isVmWareProvider && (!hasLoadedVm || !isOkStatus);
  const needsValuesReset = isVmWareProvider && !hasLoadedVm;

  if (namespace && isVmWareProvider) {
    startV2VVMWareControllerWithCleanup(props, { namespace }); // fire side effect
  }

  const vmFieldUpdate = {
    isDisabled: asDisabled(isEditingDisabled, VMWARE_PROVIDER_METADATA_ID),
    value: needsValuesReset ? null : undefined,
  };

  return {
    [NAME_KEY]: vmFieldUpdate,
    [DESCRIPTION_KEY]: vmFieldUpdate,
    [OPERATING_SYSTEM_KEY]: vmFieldUpdate,
    [FLAVOR_KEY]: vmFieldUpdate,
    [MEMORY_KEY]: vmFieldUpdate,
    [CPU_KEY]: vmFieldUpdate,
    [WORKLOAD_PROFILE_KEY]: vmFieldUpdate,
    [USE_CLOUD_INIT_KEY]: vmFieldUpdate,
    [PROVIDERS_DATA_KEY]: {
      [PROVIDER_VMWARE]: {
        [PROVIDER_VMWARE_VCENTER_KEY]: requiredMetadata,
        [PROVIDER_VMWARE_HOSTNAME_KEY]: hiddenMetadata,
        [PROVIDER_VMWARE_USER_NAME_KEY]: hiddenMetadata,
        [PROVIDER_VMWARE_USER_PASSWORD_KEY]: hiddenMetadata,
        [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: hiddenMetadata,
        [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: hiddenMetadata,
        [PROVIDER_VMWARE_VM_KEY]: {
          isHidden: asHidden(!isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
          isRequired: asRequired(isVmWareProvider, VMWARE_PROVIDER_METADATA_ID),
          isDisabled: asDisabled(!isOkStatus, VMWARE_PROVIDER_METADATA_ID),
        },
        [PROVIDER_VMWARE_STATUS_KEY]: {
          isHidden: asHidden(
            !isVmWareProvider || [...V2V_WMWARE_STATUS_ALL_OK, V2V_WMWARE_STATUS_UNKNOWN].includes(status),
            VMWARE_PROVIDER_METADATA_ID
          ),
        },
      },
    },
  };
};

export const secretUpdateCreator = (prevProps, prevState, props, state, extra) => {
  if (
    !hasVmWareSettingsChanged(
      prevState,
      state,
      PROVIDER_VMWARE_VCENTER_KEY,
      PROVIDER_VMWARE_HOSTNAME_KEY,
      PROVIDER_VMWARE_USER_NAME_KEY,
      PROVIDER_VMWARE_USER_PASSWORD_KEY
    )
  ) {
    return null;
  }

  const isNewInstanceSecret = isVmwareNewInstanceSecret(state);

  const hasPrerequisiteValues =
    isNewInstanceSecret &&
    getVmwareValue(state, PROVIDER_VMWARE_HOSTNAME_KEY) &&
    getVmwareValue(state, PROVIDER_VMWARE_USER_NAME_KEY) &&
    getVmwareValue(state, PROVIDER_VMWARE_USER_PASSWORD_KEY);

  const hiddenMetadata = {
    isHidden: asHidden(!isNewInstanceSecret, PROVIDER_VMWARE_VCENTER_KEY),
  };

  const metadata = {
    ...hiddenMetadata,
    isRequired: asRequired(isNewInstanceSecret, PROVIDER_VMWARE_VCENTER_KEY),
  };

  return {
    [PROVIDER_VMWARE_HOSTNAME_KEY]: metadata,
    [PROVIDER_VMWARE_USER_NAME_KEY]: metadata,
    [PROVIDER_VMWARE_USER_PASSWORD_KEY]: metadata,
    [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: hiddenMetadata,
    [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: {
      ...hiddenMetadata,
      isDisabled: asDisabled(!hasPrerequisiteValues, PROVIDER_VMWARE_VCENTER_KEY),
    },
  };
};

export const secretValueUpdateCreator = (prevProps, prevState, props, state, extra) => {
  if (!hasVmWareSettingsValuesChanged(prevState, state, PROVIDER_VMWARE_VCENTER_KEY)) {
    return null;
  }

  const connectionSecretName = getVmwareValue(state, PROVIDER_VMWARE_VCENTER_KEY);
  const isNewInstanceSecret = isVmwareNewInstanceSecret(state);

  if (!isNewInstanceSecret && connectionSecretName) {
    // side effect
    createConnectionObjects(
      props,
      {
        namespace: getVmSettingValue(state, NAMESPACE_KEY),
        connectionSecretName,
      },
      extra
    );
  }

  return {
    [PROVIDER_VMWARE_V2V_NAME_KEY]: isNewInstanceSecret || !connectionSecretName ? null : undefined,
  };
};

export const successfulConnectionUpdateCreator = (prevProps, prevState, props, state, extra) => {
  const connectionStatus = getVmwareValue(state, PROVIDER_VMWARE_STATUS_KEY);

  if (connectionStatus !== V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL) {
    return null;
  }

  const vCenterName = getVmwareField(state, PROVIDER_VMWARE_NEW_VCENTER_NAME_KEY);
  const secret = props.vCenterSecrets.find(s => getName(s) === vCenterName);
  const hasTempLabel = has(getVmwareSecretLabels(secret), VCENTER_TEMPORARY_LABEL);
  const saveCredentialsRequested = getVmwareValue(state, PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY);

  if (saveCredentialsRequested && hasTempLabel) {
    const patch = removeLabelFromVmwareSecretPatch(VCENTER_TEMPORARY_LABEL);
    props.k8sPatch(SecretModel, secret, patch).catch(err => {
      if (!get(err, 'message').includes('Unable to remove nonexistent key')) {
        console.error(err); // eslint-disable-line no-console
      }
    });
  }

  if (!saveCredentialsRequested && !hasTempLabel) {
    const patch = addLabelToVmwareSecretPatch(VCENTER_TEMPORARY_LABEL);
    props.k8sPatch(SecretModel, secret, patch).catch(err => console.log(err)); // eslint-disable-line no-console
  }

  return null;
};

export const saveSecretUpdateCreator = (prevProps, prevState, props, state, extra) => {
  if (!hasVmWareSettingsValuesChanged(prevState, state, PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY)) {
    return null;
  }

  const saveCredentialsRequested = getVmwareValue(state, PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY);

  return {
    [PROVIDER_VMWARE_CHECK_CONNECTION_BTN_TEXT_KEY]: saveCredentialsRequested
      ? PROVIDER_VMWARE_CHECK_CONNECTION_BTN_SAVE
      : PROVIDER_VMWARE_CHECK_CONNECTION_BTN_DONT_SAVE,
  };
};

export const checkConnectionUpdateCreator = (prevProps, prevState, props, state, extra) => {
  const oldConnect = !!getVmwareValue(prevState, PROVIDER_VMWARE_CHECK_CONNECTION_KEY);
  const connect = !!getVmwareValue(state, PROVIDER_VMWARE_CHECK_CONNECTION_KEY);
  if (oldConnect || !connect) {
    // oldConnect is still pending
    return null;
  }

  const metadata = { isDisabled: asDisabled(true, PROVIDER_VMWARE_CHECK_CONNECTION_KEY) };
  const afterMetadata = { isDisabled: asDisabled(false, PROVIDER_VMWARE_CHECK_CONNECTION_KEY) };

  const afterData = {
    [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: afterMetadata,
    [PROVIDER_VMWARE_HOSTNAME_KEY]: afterMetadata,
    [PROVIDER_VMWARE_USER_NAME_KEY]: afterMetadata,
    [PROVIDER_VMWARE_USER_PASSWORD_KEY]: afterMetadata,
    [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: afterMetadata,
    [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: {
      ...afterMetadata,
      value: false, // must be here if the update completes before this return
    },
  };

  // side effect
  createConnectionObjects(
    props,
    {
      namespace: getVmSettingValue(state, NAMESPACE_KEY),
      url: getVmwareValue(state, PROVIDER_VMWARE_HOSTNAME_KEY),
      username: getVmwareValue(state, PROVIDER_VMWARE_USER_NAME_KEY),
      password: getVmwareValue(state, PROVIDER_VMWARE_USER_PASSWORD_KEY),
    },
    extra,
    afterData
  );

  return {
    [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: {
      ...metadata,
      value: false,
    },
    [PROVIDER_VMWARE_STATUS_KEY]: {
      value: getSimpleV2vVMwareStatus(null, { isConnecting: true }),
    },
    [PROVIDER_VMWARE_HOSTNAME_KEY]: metadata,
    [PROVIDER_VMWARE_USER_NAME_KEY]: metadata,
    [PROVIDER_VMWARE_USER_PASSWORD_KEY]: metadata,
    [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: metadata,
    [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: metadata,
  };
};

export const vmwareNameChangedUpdateCreator = (prevProps, prevState, props, state) => {
  if (!hasVmWareSettingsChanged(prevState, state, PROVIDER_VMWARE_V2V_NAME_KEY)) {
    return null;
  }

  const v2vName = getVmwareField(state, PROVIDER_VMWARE_V2V_NAME_KEY);

  return {
    [PROVIDER_VMWARE_VM_KEY]: {
      isDisabled: asDisabled(!v2vName, PROVIDER_VMWARE_VM_KEY),
    },
  };
};

export const vmChangedUpdateCreator = (prevProps, prevState, props, state, extra) => {
  if (!hasVmWareSettingsValuesChanged(prevState, state, PROVIDER_VMWARE_VM_KEY)) {
    return null;
  }

  const params = {
    namespace: getVmSettingValue(state, NAMESPACE_KEY),
    v2vwmwareName: getVmwareField(state, PROVIDER_VMWARE_V2V_NAME_KEY),
    vmName: getVmwareValue(state, PROVIDER_VMWARE_VM_KEY),
  };

  requestVmDetails(props, params); // side effect

  return null;
};

export const vmLoadedUpdateCreator = (prevProps, prevState, props, state, extra) => {
  const vmName = getVmwareValue(state, PROVIDER_VMWARE_VM_KEY);
  const vm = getVmwareAttribute(state, PROVIDER_VMWARE_VM_KEY, 'vm');
  const prevVm = getVmwareAttribute(prevState, PROVIDER_VMWARE_VM_KEY, 'vm');

  if (!vm || vm.name !== vmName || get(prevVm, 'name') === get(vm, 'name')) {
    return null;
  }

  return prefilUpdateCreator(prevProps, prevState, props, state, extra);
};

const requestVmDetails = (props, params) => {
  info('requesting vm detail');
  requestVmDetail(params, props).catch(reason => {
    // eslint-disable-next-line no-console
    console.warn(
      'onVCenterVmSelectedConnected: Failed to patch the V2VVMWare object to query VM details: ',
      params,
      ', reason: ',
      reason
    );
  });
};

const setVmWareData = (safeSetState, vmWareData) =>
  safeSetState(state => objectMerge({}, state, vmWareSettingsCreator(() => vmWareData)()));

const createConnectionObjects = (props, params, { safeSetState }, afterData) => {
  const create = params.connectionSecretName ? createV2VvmwareObject : createV2VvmwareObjectWithSecret;

  info('creating v2vvmware object');
  create(params, props)
    .then(v2vVmware =>
      setVmWareData(safeSetState, {
        ...afterData,
        [PROVIDER_VMWARE_STATUS_KEY]: {
          // still "connecting" here, let content in the "status" of the CR decide otherwise (set by controller)
          value: getSimpleV2vVMwareStatus(null, { isConnecting: true }),
        },
        [PROVIDER_VMWARE_V2V_NAME_KEY]: getName(v2vVmware),
        [PROVIDER_VMWARE_NEW_VCENTER_NAME_KEY]: getVmwareConnectionName(v2vVmware),
      })
    )
    .catch(err => {
      warn('onVmwareCheckConnection(): Check for VMWare credentials failed, reason: ', err);
      setVmWareData(safeSetState, {
        ...afterData,
        [PROVIDER_VMWARE_STATUS_KEY]: {
          // The CR can not be created
          value: getSimpleV2vVMwareStatus(null, { hasConnectionFailed: true }),
        },
      });
    });
};

const startV2VVMWareControllerWithCleanup = (props, { namespace }) => {
  const enhancedK8sMethods = new EnhancedK8sMethods(props);

  startV2VVMWareController({ namespace }, enhancedK8sMethods)
    .catch(e =>
      // eslint-disable-next-line promise/no-nesting
      cleanupAndGetResults(enhancedK8sMethods, e).then(({ results }) =>
        errorsFirstSort(results).forEach(o => warn(o.title, o.content))
      )
    )
    .catch(le => error(le));
};

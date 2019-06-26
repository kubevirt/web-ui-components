import { asDisabled, asHidden, VMWARE_PROVIDER_METADATA_ID } from '../../utils/vmSettingsTabUtils';
import { PROVIDER_SELECT_VM } from '../../strings';
import {
  PROVIDER_VMWARE_CHECK_CONNECTION_KEY,
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_NEW_VCENTER_NAME_KEY,
  PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY,
  PROVIDER_VMWARE_STATUS_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PASSWORD_KEY,
  PROVIDER_VMWARE_V2V_NAME_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from '../../providers/VMwareImportProvider/constants';
import { getSimpleV2vVMwareStatus } from '../../../../../utils/status/v2vVMware/v2vVMwareStatus';

export const getFieldId = key => idResolver[key];
export const getFieldTitle = key => titleResolver[key];
export const getDefaultValue = key => defaultValueResolver[key] || '';
export const getFieldHelp = (key, value) => {
  const resolveFunction = helpResolver[key];
  return resolveFunction ? resolveFunction(value) : null;
};

export const getVmWareInitialState = props => ({
  [PROVIDER_VMWARE_VCENTER_KEY]: {},
  [PROVIDER_VMWARE_HOSTNAME_KEY]: {},
  [PROVIDER_VMWARE_USER_NAME_KEY]: {},
  [PROVIDER_VMWARE_USER_PASSWORD_KEY]: {},
  [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: {
    isDisabled: asDisabled(true, PROVIDER_VMWARE_VCENTER_KEY),
  },
  [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: { value: true },
  [PROVIDER_VMWARE_VM_KEY]: {
    isDisabled: asDisabled(true, PROVIDER_VMWARE_VM_KEY),
  },
  [PROVIDER_VMWARE_STATUS_KEY]: {
    isHidden: asHidden(true, VMWARE_PROVIDER_METADATA_ID),
    value: getSimpleV2vVMwareStatus(), // UNKNOWN
  },

  // simple values
  [PROVIDER_VMWARE_V2V_NAME_KEY]: null,
  [PROVIDER_VMWARE_NEW_VCENTER_NAME_KEY]: null,
});

const titleResolver = {
  [PROVIDER_VMWARE_VCENTER_KEY]: 'vCenter Instance',
  [PROVIDER_VMWARE_HOSTNAME_KEY]: 'vCenter Hostname',
  [PROVIDER_VMWARE_USER_NAME_KEY]: 'vCenter User Name',
  [PROVIDER_VMWARE_USER_PASSWORD_KEY]: 'vCenter Password',
  [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: 'Save as New vCenter Instance',
  [PROVIDER_VMWARE_VM_KEY]: 'VM to Import',
};

const idResolver = {
  [PROVIDER_VMWARE_VCENTER_KEY]: 'vcenter-instance-dropdown',
  [PROVIDER_VMWARE_HOSTNAME_KEY]: 'vcenter-hostname-dropdown',
  [PROVIDER_VMWARE_USER_NAME_KEY]: 'vcenter-username',
  [PROVIDER_VMWARE_USER_PASSWORD_KEY]: 'vcenter-password',
  [PROVIDER_VMWARE_CHECK_CONNECTION_KEY]: 'vcenter-connect',
  [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: 'vcenter-remember-credentials',
  [PROVIDER_VMWARE_STATUS_KEY]: 'vcenter-status',
  [PROVIDER_VMWARE_VM_KEY]: 'vcenter-vm-dropdown',
};

const defaultValueResolver = {
  [PROVIDER_VMWARE_VCENTER_KEY]: '--- Select vCenter Instance Secret ---',
  [PROVIDER_VMWARE_VM_KEY]: PROVIDER_SELECT_VM,
};

const helpResolver = {
  [PROVIDER_VMWARE_VCENTER_KEY]: () => 'Select secret containing connection details for a vCenter instance.',
  [PROVIDER_VMWARE_HOSTNAME_KEY]: () =>
    'Address to be used for connection to a vCenter instance. The "https://" protocol will be added automatically. Example: "my.domain.com:1234".',

  [PROVIDER_VMWARE_USER_NAME_KEY]: () => 'User name to be used for connection to a vCenter instance.',
  [PROVIDER_VMWARE_USER_PASSWORD_KEY]: () => 'User password to be used for connection to a vCenter instance.',
  [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: () =>
    'If checked, a new secret containing the connection details will be created for future use.',
  [PROVIDER_VMWARE_VM_KEY]: () =>
    'Select a vCenter virtual machine to import. Loading of their list might take some time. The list will be enabled for selection once data are loaded.',
};

export const PROVIDER_VMWARE_CHECK_CONNECTION_BTN_SAVE = 'Check and Save';
export const PROVIDER_VMWARE_CHECK_CONNECTION_BTN_DONT_SAVE = 'Check';

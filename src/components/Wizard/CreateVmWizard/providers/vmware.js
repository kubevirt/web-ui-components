import { isImportProviderType, settingsValue } from '../../../../k8s/selectors';
import { CONNECT_TO_NEW_INSTANCE, PROVIDER_SELECT_VM } from '../strings';
import { validateVmwareURL } from '../../../../utils/validations';

import {
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_STATUS_KEY,
  PROVIDER_VMWARE_HOSTNAME_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from '../constants';

import VMWarePasswordAndCheck from './VMWarePasswordAndCheck';
import VMWareProviderStatus, { hasConnection } from './VMWareProviderStatus';
import VCenterInstances from './VCenterInstances';
import { onVCenterInstanceSelected, onVmwareCheckConnection, onVCenterVmSelectedConnected } from './vmwareActions';
import VCenterVms from './VCenterVms';
import { CHECKBOX, CUSTOM } from '../../../Form';

export const isVmwareNewInstance = basicSettings =>
  settingsValue(basicSettings, PROVIDER_VMWARE_VCENTER_KEY) === CONNECT_TO_NEW_INSTANCE;
export const isNewVmwareInstanceSelected = basicVmSettings =>
  isVmwareProvider(basicVmSettings) && isVmwareNewInstance(basicVmSettings);

export const isVmwareProvider = basicVmSettings => isImportProviderType(basicVmSettings, PROVIDER_VMWARE);

const getVMWareNewConnectionSection = (basicSettings, WithResources, k8sCreate) => ({
  [PROVIDER_VMWARE_HOSTNAME_KEY]: {
    id: 'vcenter-hostname-dropdown',
    title: 'vCenter Hostname',
    required: true,
    isVisible: isNewVmwareInstanceSelected,
    validate: settings => validateVmwareURL(settingsValue(settings, PROVIDER_VMWARE_HOSTNAME_KEY)),
    defaultValue: 'https://host:port/',
    help:
      'Address to be used for connection to a vCenter instance. The "https://" protocol will be added automatically. Example: "my.domain.com:1234".',
  },
  [PROVIDER_VMWARE_USER_NAME_KEY]: {
    id: 'vcenter-username',
    title: 'vCenter User Name',
    required: true,
    isVisible: isNewVmwareInstanceSelected,
    help: 'User name to be used for connection to a vCenter instance.',
  },
  [PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY]: {
    id: 'vcenter-userpwd',
    title: 'vCenter Password',
    type: CUSTOM,
    CustomComponent: VMWarePasswordAndCheck,
    extraProps: {
      onCheckConnection: onConnectionStateChanged =>
        onVmwareCheckConnection(basicSettings, onConnectionStateChanged, k8sCreate),
      WithResources,
      basicSettings,
    },
    required: true,
    isVisible: isNewVmwareInstanceSelected,
    // validate: settings => validateVmwareConnection(settingsValue(settings, PROVIDER_VMWARE_CONNECTION)),
    help: 'User password to be used for connection to a vCenter instance.',
  },
  [PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY]: {
    id: 'vcenter-remember-credentials',
    title: 'Remember vCenter credentials',
    type: CHECKBOX,
    isVisible: isNewVmwareInstanceSelected,
    help: 'If checked, new secret keeping connection details will be created for later use.', // text is recently not rendered
  },
});

export const getVMWareSection = (basicSettings, operatingSystems, WithResources, k8sCreate, k8sGet, k8sPatch) => ({
  [PROVIDER_VMWARE_VCENTER_KEY]: {
    id: 'vcenter-instance-dropdown',
    title: 'vCenter Instance',
    type: CUSTOM,
    CustomComponent: VCenterInstances,
    extraProps: {
      WithResources,
      basicSettings,
    },
    onChange: (...props) => onVCenterInstanceSelected(k8sCreate, ...props),
    required: true,
    isVisible: isVmwareProvider,
    defaultValue: '--- Select vCenter Instance Secret ---',
    help: 'Select secret containing connection details for a vCenter instance.',
  },
  ...getVMWareNewConnectionSection(basicSettings, WithResources, k8sCreate),
  [PROVIDER_VMWARE_STATUS_KEY]: {
    id: 'vcenter-status',
    type: CUSTOM,
    title: ' ',
    CustomComponent: VMWareProviderStatus,
    extraProps: {
      onCheckConnection: onConnectionStateChanged =>
        onVmwareCheckConnection(basicSettings, onConnectionStateChanged, k8sCreate),
      WithResources,
      basicSettings,
    },
    isVisible: settings => isVmwareProvider(settings) && hasConnection(settings),
  },
  [PROVIDER_VMWARE_VM_KEY]: {
    id: 'vcenter-vm-dropdown',
    title: 'VM to Import',
    type: CUSTOM,
    CustomComponent: VCenterVms,
    extraProps: {
      WithResources,
      k8sGet,
      basicSettings,
      operatingSystems,
    },
    onChange: (...props) => onVCenterVmSelectedConnected(k8sCreate, k8sGet, k8sPatch, ...props),
    required: true,
    isVisible: isVmwareProvider,
    defaultValue: PROVIDER_SELECT_VM,
    help:
      'Select a vCenter virtual machine to import. Loading of their list might take some time. The list will be enabled for selection once data are loaded.',
  },
});

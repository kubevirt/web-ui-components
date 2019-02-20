import { get } from 'lodash';

import { isImportProviderType, settingsValue } from '../../../../k8s/selectors';
import { CONNECT_TO_NEW_INSTANCE, PROVIDER_SELECT_VM } from '../strings';
import { validateVmwareURL } from '../../../../utils/validations';

import {
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_URL_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from '../constants';

import VMWarePasswordAndCheck from './VMWarePasswordAndCheck';
import VCenterInstances from './VCenterInstances';
import { onVCenterInstanceSelected, onVmwareCheckConnection, onVCenterVmSelectedConnected } from './vmwareActions';
import VCenterVms from './VCenterVms';

const isVmwareNewInstance = basicSettings =>
  get(basicSettings, [PROVIDER_VMWARE_VCENTER_KEY, 'value']) === CONNECT_TO_NEW_INSTANCE;
const isNewVmwareInstanceSelected = basicVmSettings =>
  isImportProviderType(basicVmSettings, PROVIDER_VMWARE) && isVmwareNewInstance(basicVmSettings);

const getVMWareNewConnectionSection = (basicSettings, WithResources, k8sCreate, k8sGet, k8sPatch) => ({
  [PROVIDER_VMWARE_URL_KEY]: {
    id: 'vcenter-url-dropdown',
    title: 'vCenter URL',
    required: true,
    isVisible: isNewVmwareInstanceSelected,
    validate: settings => validateVmwareURL(settingsValue(settings, PROVIDER_VMWARE_URL_KEY)),
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
    type: 'custom',
    CustomComponent: VMWarePasswordAndCheck,
    extraProps: {
      onCheckConnection: onConnectionStateChanged =>
        onVmwareCheckConnection(basicSettings, onConnectionStateChanged, k8sCreate, k8sGet, k8sPatch),
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
    required: true,
    type: 'checkbox',
    isVisible: isNewVmwareInstanceSelected,
    help: 'If checked, new secret keeping connection details will be created for later use.',
  },
});

export const getVMWareSection = (basicSettings, WithResources, k8sCreate, k8sGet, k8sPatch) => ({
  [PROVIDER_VMWARE_VCENTER_KEY]: {
    id: 'vcenter-instance-dropdown',
    title: 'vCenter Instance',
    type: 'custom',
    CustomComponent: VCenterInstances,
    extraProps: {
      WithResources,
      basicSettings,
    },
    onChange: (...props) => onVCenterInstanceSelected(k8sCreate, ...props),
    required: true,
    isVisible: basicVmSettings => isImportProviderType(basicVmSettings, PROVIDER_VMWARE),
    defaultValue: '--- Select vCenter Instance Secret ---',
    help: 'Select secret containing connection details for a vCenter instance.',
  },
  ...getVMWareNewConnectionSection(basicSettings, WithResources, k8sCreate, k8sGet, k8sPatch),
  [PROVIDER_VMWARE_VM_KEY]: {
    id: 'vcenter-vm-dropdown',
    title: 'VM to Import',
    type: 'custom',
    CustomComponent: VCenterVms,
    extraProps: {
      WithResources,
      basicSettings,
    },
    onChange: (...props) => onVCenterVmSelectedConnected(k8sCreate, k8sGet, k8sPatch, ...props),
    required: true,
    isVisible: basicVmSettings => isImportProviderType(basicVmSettings, PROVIDER_VMWARE),
    defaultValue: PROVIDER_SELECT_VM,
    help:
      'Select a vCenter virtual machine to import. Loading of their list might take some time. The list will be enabled for selection once data are loaded.',
  },
});

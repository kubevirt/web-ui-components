import React from "react";
import { get } from 'lodash';

import { isImportProviderType, settingsValue } from '../../../../k8s/selectors';
import { CONNECT_TO_NEW_INSTANCE } from '../strings';
import { validateVmwareURL } from '../../../../utils/validations';

import {
  PROVIDER_VMWARE,
  PROVIDER_VMWARE_URL_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY,
  PROVIDER_VMWARE_VCENTER_KEY,
  PROVIDER_VMWARE_VM_KEY
} from '../constants'

import VMWarePasswordAndCheck from './VMWarePasswordAndCheck';
import { onVCenterInstanceSelected, onVmwareCheckConnection } from './vmwareActions';
import { getVCenterInstancesConnected } from './VCenterInstances';
import { getVCenterVmsConnected } from './VCenterVms';

const isVmwareNewInstance = basicSettings => get(basicSettings, [PROVIDER_VMWARE_VCENTER_KEY, 'value']) == CONNECT_TO_NEW_INSTANCE;
const isNewVmwareInstanceSelected = basicVmSettings => isImportProviderType(basicVmSettings, PROVIDER_VMWARE) && isVmwareNewInstance(basicVmSettings);

const getVMWareNewConnectionSection = (basicSettings, k8sCreate) => {
  return {
    [PROVIDER_VMWARE_URL_KEY]: {
      id: 'vcenter-url-dropdown',
      title: 'vCenter URL',
      required: true,
      isVisible: isNewVmwareInstanceSelected,
      validate: settings => validateVmwareURL(settingsValue(settings, PROVIDER_VMWARE_URL_KEY)),
      defaultValue: 'https://host:port/',
      help: 'Address to be used for connection to a vCenter instance. Example: https://host:port/'
    },
    [PROVIDER_VMWARE_USER_NAME_KEY]: {
      id: 'vcenter-username',
      title: 'vCenter User Name',
      required: true,
      isVisible: isNewVmwareInstanceSelected,
      help: 'User name to be used for connection to a vCenter instance.'
    },
    [PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY]: {
      id: 'vcenter-userpwd',
      title: 'vCenter Password',
      type: 'custom',
      CustomComponent: VMWarePasswordAndCheck,
      extraProps: {
        onCheckConnection: onConnectionStateChanged => onVmwareCheckConnection(basicSettings, onConnectionStateChanged, k8sCreate),
      },
      required: true,
      isVisible: isNewVmwareInstanceSelected,
      // validate: settings => validateVmwareConnection(settingsValue(settings, PROVIDER_VMWARE_CONNECTION)),
      help: 'User password to be used for connection to a vCenter instance.'
    },
    [PROVIDER_VMWARE_USER_PWD_REMEMBER_KEY]: {
      id: 'vcenter-remember-credentials',
      title: 'Remember vCenter credentials',
      required: true,
      type: 'checkbox',
      isVisible: isNewVmwareInstanceSelected,
      help: 'If checked, new secret keeping connection details will be created for later use.'
    },
  };
};

export const getVMWareSection = (basicSettings, WithResources, k8sCreate) => {
  console.log('--- basicSettings: ', basicSettings);
  return {
    [PROVIDER_VMWARE_VCENTER_KEY]: {
      id: 'vcenter-instance-dropdown',
      title: 'vCenter Instance',
      type: 'custom',
      CustomComponent: getVCenterInstancesConnected(basicSettings, WithResources),
      required: true,
      onChange: onVCenterInstanceSelected,
      isVisible: basicVmSettings => isImportProviderType(basicVmSettings, PROVIDER_VMWARE),
      defaultValue: '--- Select vCenter Instance Secret ---',
      help: 'Select secret containing connection details for a vCenter instance.'
    },
    ...getVMWareNewConnectionSection(basicSettings, k8sCreate),
    [PROVIDER_VMWARE_VM_KEY]: {
      id: 'vcenter-vm-dropdown',
      title: 'VM to Import',
      type: 'custom',
      CustomComponent: getVCenterVmsConnected(basicSettings, WithResources),
      required: true,
      isVisible: basicVmSettings => isImportProviderType(basicVmSettings, PROVIDER_VMWARE),
      defaultValue: '--- Select VM ---',
      help: 'Select a vCenter virtual machine to import. Loading of their list might take some time.'
    },
  }
};

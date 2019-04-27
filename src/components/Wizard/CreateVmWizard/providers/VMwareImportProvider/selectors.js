import { get, isEqual } from 'lodash';

import { PROVIDER_KEY, PROVIDERS_DATA_KEY, PROVISION_SOURCE_TYPE_KEY } from '../../constants';
import { CONNECT_TO_NEW_INSTANCE } from '../../strings';
import { PROVISION_SOURCE_IMPORT } from '../../../../../constants';
import { PROVIDER_VMWARE, PROVIDER_VMWARE_VCENTER_KEY } from './constants';
import { getVmSettings, getVmSettingValue } from '../../utils/vmSettingsTabUtils';

export const isVmwareNewInstanceSecret = state =>
  getVmwareValue(state, PROVIDER_VMWARE_VCENTER_KEY) === CONNECT_TO_NEW_INSTANCE;

export const isVmwareProvider = state =>
  getVmSettingValue(state, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_IMPORT &&
  getVmSettingValue(state, PROVIDER_KEY) === PROVIDER_VMWARE;

export const getVmwareField = (state, key, defaultValue) =>
  get(getVmSettings(state), [PROVIDERS_DATA_KEY, PROVIDER_VMWARE, key], defaultValue);

export const getVmwareAttribute = (state, key, attribute = 'value', defaultValue) =>
  get(getVmwareField(state, key), attribute, defaultValue);

export const getVmwareValue = (state, key, defaultValue) => getVmwareAttribute(state, key, 'value', defaultValue);

export const hasVmWareSettingsChanged = (prevState, state, ...keys) =>
  keys.find(key => !isEqual(getVmwareField(prevState, key), getVmwareField(state, key)));

export const hasVmWareSettingsValuesChanged = (prevState, state, ...keys) =>
  keys.find(key => !isEqual(getVmwareValue(prevState, key), getVmwareValue(state, key)));

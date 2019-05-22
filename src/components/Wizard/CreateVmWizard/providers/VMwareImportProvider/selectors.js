import { get } from '../../../../../selectors';

import { PROVIDER_KEY, PROVIDERS_DATA_KEY, PROVISION_SOURCE_TYPE_KEY } from '../../constants';
import { CONNECT_TO_NEW_INSTANCE } from '../../strings';
import { PROVISION_SOURCE_IMPORT } from '../../../../../constants';
import { PROVIDER_VMWARE, PROVIDER_VMWARE_VCENTER_KEY } from './constants';
import { getVmSettings, getVmSettingValue } from '../../utils/vmSettingsTabUtils';

export const getVmwareData = (state, id) => get(getVmSettings(state, id), [PROVIDERS_DATA_KEY, PROVIDER_VMWARE]);

export const getVmwareField = (state, id, key, defaultValue) => get(getVmwareData(state, id), key, defaultValue);

export const getVmwareAttribute = (state, id, key, attribute = 'value', defaultValue) =>
  get(getVmwareField(state, id, key), attribute, defaultValue);

export const getVmwareValue = (state, id, key, defaultValue) =>
  getVmwareAttribute(state, id, key, 'value', defaultValue);

export const isVmwareNewInstanceSecret = (state, id) =>
  getVmwareValue(state, id, PROVIDER_VMWARE_VCENTER_KEY) === CONNECT_TO_NEW_INSTANCE;

export const isVmwareProvider = (state, id) =>
  getVmSettingValue(state, id, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_IMPORT &&
  getVmSettingValue(state, id, PROVIDER_KEY) === PROVIDER_VMWARE;

export const hasVmWareSettingsChanged = (prevState, state, id, ...keys) =>
  keys.find(key => getVmwareField(prevState, id, key) !== getVmwareField(state, id, key));

export const hasVmWareSettingsValueChanged = (prevState, state, id, ...keys) =>
  keys.find(key => getVmwareValue(prevState, id, key) !== getVmwareValue(state, id, key));

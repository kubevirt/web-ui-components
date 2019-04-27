import { get, isEqual } from 'lodash';

import { hasObjectTruthyValue } from '../../../../utils';
import { PROVIDER_KEY, VM_SETTINGS_TAB_KEY } from '../constants';
import { settingsValue } from '../../../..';
import { cleanupProvider } from '../providers';

export const VM_SETTINGS_METADATA_ID = 'VM_SETTINGS_METADATA_ID';
export const VMWARE_PROVIDER_METADATA_ID = 'VMWARE_PROVIDER_METADATA_ID';

export const asValueObject = value => ({ value });

export const isFieldRequired = field => hasObjectTruthyValue(get(field, 'isRequired'));
export const isFieldHidden = field => hasObjectTruthyValue(get(field, 'isHidden'));
export const isFieldDisabled = field => hasObjectTruthyValue(get(field, 'isDisabled'));

export const asRequired = (value, key = VM_SETTINGS_METADATA_ID) => ({ [key]: !!value });
export const asHidden = (value, key = VM_SETTINGS_METADATA_ID) => ({ [key]: !!value });
export const asDisabled = (value, key = VM_SETTINGS_METADATA_ID) => ({ [key]: !!value });

export const hasVmSettingsChanged = (prevState, state, ...keys) =>
  keys.find(key => !isEqual(getVmSetting(prevState, key), getVmSetting(state, key)));

export const didPropChange = (prevProps, props, key, getCompareValue) =>
  !isEqual(getCompareValue(get(prevProps, key)), getCompareValue(get(props, key)));

export const getVmSettings = state => get(state, ['stepData', VM_SETTINGS_TAB_KEY, 'value']) || state;

export const getVmSetting = (state, path, defaultValue) => get(getVmSettings(state), path, defaultValue);
export const getVmSettingAttribute = (state, key, attribute = 'value', defaultValue) =>
  getVmSetting(state, [key, attribute], defaultValue);

export const getVmSettingValue = (state, key, defaultValue) => getVmSettingAttribute(state, key, 'value', defaultValue);

// Do clean-up
export const onCloseVmSettings = async (vmSettings, callerContext) => {
  const provider = settingsValue(vmSettings, PROVIDER_KEY);
  cleanupProvider(provider, vmSettings, callerContext);
};

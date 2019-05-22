import { get } from '../../../../selectors';

import { VM_SETTINGS_TAB_KEY } from '../constants';
import { hasTruthyValue } from '../../../../utils/immutable';

export const VM_SETTINGS_METADATA_ID = 'VM_SETTINGS_METADATA_ID';
export const VMWARE_PROVIDER_METADATA_ID = 'VMWARE_PROVIDER_METADATA_ID';

export const isFieldRequired = field => hasTruthyValue(get(field, 'isRequired'));
export const isFieldHidden = field => hasTruthyValue(get(field, 'isHidden'));
export const isFieldDisabled = field => hasTruthyValue(get(field, 'isDisabled'));

export const asRequired = (value, key = VM_SETTINGS_METADATA_ID) => ({ [key]: !!value });
export const asHidden = (value, key = VM_SETTINGS_METADATA_ID) => ({ [key]: !!value });
export const asDisabled = (value, key = VM_SETTINGS_METADATA_ID) => ({ [key]: !!value });

export const getVmSettings = (state, id) =>
  get(get(state, ['kubevirt', 'createVmWizards']), [id, VM_SETTINGS_TAB_KEY, 'value']) || state;
export const getVmSetting = (state, id, path, defaultValue) => get(getVmSettings(state, id), path, defaultValue);

export const hasVmSettingsChanged = (prevState, state, id, ...keys) =>
  keys.find(key => getVmSetting(prevState, id, key) !== getVmSetting(state, id, key));

export const getVmSettingAttribute = (state, id, key, attribute = 'value', defaultValue) =>
  getVmSetting(state, id, [key, attribute], defaultValue);

export const getVmSettingValue = (state, id, key, defaultValue) =>
  getVmSettingAttribute(state, id, key, 'value', defaultValue);

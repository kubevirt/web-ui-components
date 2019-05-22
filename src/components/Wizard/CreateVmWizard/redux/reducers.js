import { Map as ImmutableMap, fromJS } from 'immutable';

import { types, internalTypes } from './actions';
import {
  VM_SETTINGS_TAB_KEY,
  PROVIDERS_DATA_KEY,
  NETWORKS_TAB_KEY,
  STORAGE_TAB_KEY,
  RESULT_TAB_KEY,
} from '../constants';

// Merge deep in without updating the keys with undefined values
const mergeDeepInSpecial = (state, path, value) =>
  state.updateIn(path, oldValue =>
    oldValue
      ? oldValue.mergeDeepWith(
          (oldSubValue, newSubValue) => (typeof newSubValue === 'undefined' ? oldSubValue : newSubValue),
          value
        )
      : value
  );

const TAB_UPDATE_KEYS = ['value', 'valid', 'locked'];

const setTabKeys = (state, tab, action) =>
  TAB_UPDATE_KEYS.reduce((nextState, key) => {
    if (typeof action[key] === 'undefined') {
      return nextState;
    }
    return nextState.setIn([action.id, tab, key], fromJS(action[key]));
  }, state);

export default (state, action) => {
  if (!state) {
    return ImmutableMap();
  }
  const dialogId = action.id;

  switch (action.type) {
    case types.create:
      return state.set(dialogId, fromJS(action.value));
    case types.dispose:
      return state.delete(dialogId);
    case types.setNetworks:
      return setTabKeys(state, NETWORKS_TAB_KEY, action);
    case types.setStorages:
      return setTabKeys(state, STORAGE_TAB_KEY, action);
    case types.setResults:
      return setTabKeys(state, RESULT_TAB_KEY, action);
    case internalTypes.updateInternal:
      return mergeDeepInSpecial(state, [dialogId], fromJS(action.value));
    case internalTypes.setTabValidityInternal:
      return state.setIn([dialogId, action.tab, 'valid'], action.valid);
    case internalTypes.setVmSettingsFieldValueInternal:
      return state.setIn([dialogId, VM_SETTINGS_TAB_KEY, 'value', action.key, 'value'], fromJS(action.value));
    case internalTypes.setInVmSettingsInternal:
      return state.setIn([dialogId, VM_SETTINGS_TAB_KEY, 'value', ...action.path], fromJS(action.value));
    case internalTypes.setInVmSettingsBatchInternal:
      return action.batch.reduce(
        (nextState, { path, value }) =>
          nextState.setIn([dialogId, VM_SETTINGS_TAB_KEY, 'value', ...path], fromJS(value)),
        state
      );
    case internalTypes.updateVmSettingsFieldInternal:
      return mergeDeepInSpecial(state, [dialogId, VM_SETTINGS_TAB_KEY, 'value', action.key], fromJS(action.value));
    case internalTypes.updateVmSettingsInternal:
      return mergeDeepInSpecial(state, [dialogId, VM_SETTINGS_TAB_KEY, 'value'], fromJS(action.value));
    case internalTypes.updateVmSettingsProviderFieldInternal:
      return mergeDeepInSpecial(
        state,
        [dialogId, VM_SETTINGS_TAB_KEY, 'value', PROVIDERS_DATA_KEY, action.provider, action.key],
        fromJS(action.value)
      );
    case internalTypes.updateVmSettingsProviderInternal:
      return mergeDeepInSpecial(
        state,
        [dialogId, VM_SETTINGS_TAB_KEY, 'value', PROVIDERS_DATA_KEY, action.provider],
        fromJS(action.value)
      );
    default:
      break;
  }
  return state;
};

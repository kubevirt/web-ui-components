import { VM_SETTINGS_TAB_KEY, NETWORKS_TAB_KEY, STORAGE_TAB_KEY, RESULT_TAB_KEY } from '../../constants';
import { getVmSettingsInitialState } from './vmSettingsTabInitialState';
import { getNetworksInitialState } from './networksTabInitialState';
import { getStorageInitialState } from './storageTabInitialState';
import { getResultInitialState } from './resultTabInitialState';

const initialStateGetterResolver = {
  [VM_SETTINGS_TAB_KEY]: getVmSettingsInitialState,
  [NETWORKS_TAB_KEY]: getNetworksInitialState,
  [STORAGE_TAB_KEY]: getStorageInitialState,
  [RESULT_TAB_KEY]: getResultInitialState,
};

export const getTabInitialState = (tabKey, props) => {
  const getter = initialStateGetterResolver[tabKey];

  let result;
  if (getter) {
    result = getter(props);
  }

  return result || { value: {}, valid: false };
};

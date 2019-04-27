import { VM_SETTINGS_TAB_KEY, NETWORKS_TAB_KEY, STORAGE_TAB_KEY } from '../constants';
import { getVmSettingsTabStateUpdate } from './vmSettingsTabStateUpdate';
import { getNetworksTabStateUpdate } from './networksTabStateUpdate';
import { geStorageTabStateUpdate } from './storageTabStateUpdate';

const stateUpdateGetterResolver = {
  [VM_SETTINGS_TAB_KEY]: getVmSettingsTabStateUpdate,
  [NETWORKS_TAB_KEY]: getNetworksTabStateUpdate,
  [STORAGE_TAB_KEY]: geStorageTabStateUpdate,
};

export const getUpdatedState = (tabKey, prevProps, prevState, props, state, extra) => {
  const updateGetter = stateUpdateGetterResolver[tabKey];

  let update;
  if (updateGetter) {
    update = updateGetter(prevProps, prevState, props, state, extra);
  }

  return update;
};

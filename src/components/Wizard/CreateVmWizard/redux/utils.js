import { VM_SETTINGS_TAB_KEY } from '../constants';
import { setVmSettingsTabValidity, validateVmSettings } from './validations/vmSettingsTabValidation';

import { updateVmSettingsState } from './stateUpdate/vmSettings/vmSettingsTabStateUpdate';
import { cleanupProvider, getProviders } from '../providers';

const ALL_TAB_KEYS = [VM_SETTINGS_TAB_KEY];

const updaterResolver = {
  [VM_SETTINGS_TAB_KEY]: updateVmSettingsState,
};

const validateTabResolver = {
  [VM_SETTINGS_TAB_KEY]: validateVmSettings,
};

const isTabValidResolver = {
  [VM_SETTINGS_TAB_KEY]: setVmSettingsTabValidity,
};

export const updateAndValidateState = options => {
  const { prevState, changedProps, getState } = options;

  const propsChanged = Object.keys(changedProps).some(key => changedProps[key]);
  const enhancedOptions = { ...options, propsChanged };

  ALL_TAB_KEYS.forEach(tabKey => {
    const updater = updaterResolver[tabKey];
    updater && updater(enhancedOptions);
  });

  if (propsChanged || prevState !== getState()) {
    ALL_TAB_KEYS.forEach(tabKey => {
      const dataValidator = validateTabResolver[tabKey];
      const tabValidator = isTabValidResolver[tabKey];

      if (dataValidator) {
        dataValidator(options);
      }

      if (tabValidator) {
        tabValidator(enhancedOptions);
      }
    });
  }
};

export const cleanup = options => {
  getProviders().forEach(provider => {
    cleanupProvider(provider, options);
  });
};

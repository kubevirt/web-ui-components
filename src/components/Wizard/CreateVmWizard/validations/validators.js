import { VM_SETTINGS_TAB_KEY } from '../constants';
import { isVmSettingsTabValid, validateVmSettings } from './vmSettingsTabValidation';

const validateTabResolver = {
  [VM_SETTINGS_TAB_KEY]: validateVmSettings,
};

const isTabValidResolver = {
  [VM_SETTINGS_TAB_KEY]: isVmSettingsTabValid,
};

export const validateTabData = (tabKey, data, valid, props) => {
  const dataValidator = validateTabResolver[tabKey];
  const tabValidator = isTabValidResolver[tabKey];

  if (dataValidator) {
    data = dataValidator(data, props);
  }

  if (tabValidator) {
    valid = tabValidator(data);
  }

  return {
    value: data,
    valid,
  };
};

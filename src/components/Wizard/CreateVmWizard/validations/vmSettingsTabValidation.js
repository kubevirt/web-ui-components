import { get } from 'lodash';

import { isFieldRequired } from '../utils/vmSettingsTabUtils';
import {
  getValidationObject,
  validateContainer,
  validateVmLikeEntityName,
  validateURL,
  validateMemory,
  validateUserTemplate,
} from '../../../../utils/validations';
import { objectMerge } from '../../../../utils/utils';
import { settingsValue } from '../../../../k8s/selectors';
import { PROVISION_SOURCE_IMPORT, VALIDATION_ERROR_TYPE } from '../../../../constants';
import {
  CONTAINER_IMAGE_KEY,
  IMAGE_URL_KEY,
  NAME_KEY,
  NAMESPACE_KEY,
  PROVIDER_KEY,
  PROVIDERS_DATA_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  MEMORY_KEY,
  USER_TEMPLATE_KEY,
} from '../constants';
import { NAMESPACE_MUST_BE_SELECTED } from '../../../../utils/strings';
import { isProviderValid, validateProvider } from '../providers';
import { asUpdateValidator, asGenericFieldValidator } from './utils';
import { getFieldTitle } from '../initialState/vmSettingsTabInitialState';

const validateProviderDropdown = (key, vmSettings) => {
  let validation = null;
  if (
    settingsValue(vmSettings, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_IMPORT &&
    !settingsValue(vmSettings, NAMESPACE_KEY)
  ) {
    validation = getValidationObject(NAMESPACE_MUST_BE_SELECTED);
  }

  return {
    validation,
  };
};

const asVmSettingsValidator = validator => asGenericFieldValidator(asUpdateValidator(validator), getFieldTitle);

const validateResolver = {
  [NAME_KEY]: asVmSettingsValidator(validateVmLikeEntityName),
  [USER_TEMPLATE_KEY]: validateUserTemplate,
  [CONTAINER_IMAGE_KEY]: asVmSettingsValidator(validateContainer),
  [IMAGE_URL_KEY]: asVmSettingsValidator(validateURL),
  [PROVIDER_KEY]: validateProviderDropdown,
  [MEMORY_KEY]: asVmSettingsValidator(validateMemory),
};

export const validateVmSettings = (vmSettings, additionalResources) => {
  const update = {};

  Object.keys(vmSettings).forEach(key => {
    const validator = validateResolver[key];
    if (validator) {
      update[key] = validator(key, vmSettings, additionalResources);
    }
  });

  const provider = settingsValue(vmSettings, PROVIDER_KEY);
  const providerUpdate = validateProvider(provider, vmSettings);

  return objectMerge({}, vmSettings, update, providerUpdate);
};

export const isVmSettingsTabValid = newVmSettings => {
  const keys = Object.keys(newVmSettings);

  // check if all required fields are defined
  let valid = keys.filter(key => isFieldRequired(newVmSettings[key])).every(key => settingsValue(newVmSettings, key));

  if (valid) {
    const provider = settingsValue(newVmSettings, PROVIDER_KEY);
    if (provider) {
      const providersData = newVmSettings[PROVIDERS_DATA_KEY];
      valid = isProviderValid(provider, providersData[provider], newVmSettings);
    }
  }

  if (valid) {
    // check if all fields are valid
    valid = keys.every(key => get(newVmSettings, [key, 'validation', 'type']) !== VALIDATION_ERROR_TYPE);
  }

  return valid;
};

import { isEmpty } from 'lodash';

import { getVmSettings, hasVmSettingsChanged, isFieldRequired } from '../../utils/vmSettingsTabUtils';
import {
  getValidationObject,
  validateContainer,
  validateVmName,
  validateURL,
  validateMemory,
} from '../../../../../utils/validations';
import { settingsValue } from '../../../../../k8s/selectors';
import { PROVISION_SOURCE_IMPORT, VALIDATION_ERROR_TYPE } from '../../../../../constants';
import {
  CONTAINER_IMAGE_KEY,
  IMAGE_URL_KEY,
  MEMORY_KEY,
  NAME_KEY,
  NAMESPACE_KEY,
  PROVIDER_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  VIRTUAL_MACHINES_KEY,
  VM_SETTINGS_TAB_KEY,
} from '../../constants';
import { NAMESPACE_MUST_BE_SELECTED } from '../../../../../utils/strings';
import { isProviderValid, validateProvider } from '../../providers';
import { asGenericFieldValidator, getValidationUpdate } from './utils';
import { getFieldTitle } from '../initialState/vmSettingsTabInitialState';
import { internalTypes, vmWizardInternalActions } from '../actions';

const validateProviderDropdown = (key, field, vmSettings) => {
  let validation = null;
  if (
    settingsValue(vmSettings, PROVISION_SOURCE_TYPE_KEY) === PROVISION_SOURCE_IMPORT &&
    !settingsValue(vmSettings, NAMESPACE_KEY)
  ) {
    validation = getValidationObject(NAMESPACE_MUST_BE_SELECTED);
  }

  return validation;
};

const asVmSettingsValidator = validator => asGenericFieldValidator(validator, getFieldTitle);

const validateVm = asVmSettingsValidator((field, vmSettings, props) =>
  validateVmName(
    settingsValue(vmSettings, NAME_KEY),
    settingsValue(vmSettings, NAMESPACE_KEY),
    props[VIRTUAL_MACHINES_KEY]
  )
);

const validationConfig = {
  [NAME_KEY]: {
    detectValueChanges: [NAME_KEY, NAMESPACE_KEY],
    detectPropChanges: [VIRTUAL_MACHINES_KEY],
    validator: validateVm,
  },
  [CONTAINER_IMAGE_KEY]: {
    detectValueChanges: [CONTAINER_IMAGE_KEY],
    validator: asVmSettingsValidator(validateContainer),
  },
  [IMAGE_URL_KEY]: {
    detectValueChanges: [IMAGE_URL_KEY],
    validator: asVmSettingsValidator(validateURL),
  },
  [PROVIDER_KEY]: {
    detectValueChanges: [NAMESPACE_KEY, PROVISION_SOURCE_TYPE_KEY],
    validator: validateProviderDropdown,
  },
  [MEMORY_KEY]: {
    detectValueChanges: [MEMORY_KEY],
    validator: asVmSettingsValidator(validateMemory),
  },
};

export const validateVmSettings = options => {
  const { id, dispatch, getState } = options;
  const state = getState();
  const vmSettings = getVmSettings(state, id);

  const update = getValidationUpdate(validationConfig, options, vmSettings, hasVmSettingsChanged);

  if (!isEmpty(update)) {
    dispatch(vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, update));
  }

  validateProvider(settingsValue(vmSettings, PROVIDER_KEY), options);
};

export const setVmSettingsTabValidity = options => {
  const { id, dispatch, getState } = options;
  const state = getState();
  const vmSettings = getVmSettings(state, id);

  // check if all required fields are defined
  let valid = vmSettings.filter(field => isFieldRequired(field)).every(field => field.get('value'));

  if (valid) {
    const provider = settingsValue(vmSettings, PROVIDER_KEY);
    if (provider) {
      valid = isProviderValid(provider, options);
    }
  }

  if (valid) {
    // check if all fields are valid
    valid = vmSettings.every(field => field.getIn(['validation', 'type']) !== VALIDATION_ERROR_TYPE);
  }

  dispatch(vmWizardInternalActions[internalTypes.setTabValidityInternal](id, VM_SETTINGS_TAB_KEY, valid));
};

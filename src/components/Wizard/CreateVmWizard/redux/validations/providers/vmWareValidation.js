import { isEmpty } from 'lodash';

import { get } from '../../../../../../selectors';

import { validateVmwareURL } from '../../../../../../utils/validations';
import { VALIDATION_ERROR_TYPE, VALIDATION_INFO_TYPE } from '../../../../../../constants';
import { getVmSettings, hasVmSettingsChanged, isFieldRequired } from '../../../utils/vmSettingsTabUtils';
import { PROVIDER_VMWARE, PROVIDER_VMWARE_HOSTNAME_KEY } from '../../../providers/VMwareImportProvider/constants';
import { asGenericFieldValidator, getValidationUpdate } from '../utils';
import { OPERATING_SYSTEM_KEY } from '../../../constants';
import { getVmwareOsString } from '../../../strings';
import { internalTypes, vmWizardInternalActions } from '../../actions';
import { getVmwareData, hasVmWareSettingsChanged } from '../../../providers/VMwareImportProvider/selectors';

const operatingSystemValidator = (key, field) => {
  const value = get(field, 'value');
  const guestFullName = get(field, 'guestFullName');

  return value || !guestFullName
    ? null
    : {
        message: getVmwareOsString(guestFullName),
        type: VALIDATION_INFO_TYPE,
      };
};

const vmSettingsValidationConfig = {
  [OPERATING_SYSTEM_KEY]: {
    detectValueChanges: [OPERATING_SYSTEM_KEY],
    validator: operatingSystemValidator,
  },
};

// TODO extract getFieldTitle from vmWareInitialState to prevent circular dependencies
const validateVMwareConfig = {
  [PROVIDER_VMWARE_HOSTNAME_KEY]: {
    detectValueChanges: [PROVIDER_VMWARE_HOSTNAME_KEY],
    validator: asGenericFieldValidator(validateVmwareURL, () => 'vCenter Hostname'),
  },
};

export const validateVmwareProvider = options => {
  const { id, dispatch, getState } = options;
  const state = getState();
  const vmSettings = getVmSettings(state, id);

  const update = getValidationUpdate(vmSettingsValidationConfig, options, vmSettings, hasVmSettingsChanged);

  if (!isEmpty(update)) {
    dispatch(vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, update));
  }

  validateVmwareDataProvider(options);
};

export const validateVmwareDataProvider = options => {
  const { id, dispatch, getState } = options;
  const state = getState();
  const vmwareData = getVmwareData(state, id);

  const update = getValidationUpdate(validateVMwareConfig, options, vmwareData, hasVmWareSettingsChanged);

  if (!isEmpty(update)) {
    dispatch(vmWizardInternalActions[internalTypes.updateVmSettingsProviderInternal](id, PROVIDER_VMWARE, update));
  }
};

export const isVmwareProviderValid = options => {
  const { id, getState } = options;
  const state = getState();
  const vmwareData = getVmwareData(state, id);

  // check if all required fields are defined
  let valid = vmwareData.filter(field => isFieldRequired(field)).every(field => get(field, 'value'));

  if (valid) {
    // check if all fields are valid
    valid = vmwareData.every(field => get(field, ['validation', 'type']) !== VALIDATION_ERROR_TYPE);
  }
  return valid;
};

import { get, isObject } from 'lodash';

import { validateVmwareURL } from '../../../../../utils/validations';
import { VALIDATION_ERROR_TYPE, VALIDATION_INFO_TYPE } from '../../../../../constants';
import { objectMerge } from '../../../../../utils/utils';
import { settingsValue } from '../../../../../k8s/selectors';
import { isFieldRequired } from '../../utils/vmSettingsTabUtils';
import { PROVIDER_VMWARE, PROVIDER_VMWARE_HOSTNAME_KEY } from '../../providers/VMwareImportProvider/constants';
import { asUpdateValidator, asGenericFieldValidator } from '../utils';
import { OPERATING_SYSTEM_KEY, PROVIDERS_DATA_KEY } from '../../constants';
import { getVmwareOsString } from '../../strings';

const operatingSystemValidator = (key, vmSettings) => {
  const os = vmSettings[key] || {};
  const { value, guestFullName } = os;

  return {
    validation:
      value || !guestFullName
        ? null
        : {
            message: getVmwareOsString(guestFullName),
            type: VALIDATION_INFO_TYPE,
          },
  };
};

const validateResolver = {
  [OPERATING_SYSTEM_KEY]: operatingSystemValidator,
};

// TODO extract getFieldTitle from vmWareInitialState to prevent circular dependencies
const validateVMwareResolver = {
  [PROVIDER_VMWARE_HOSTNAME_KEY]: asGenericFieldValidator(
    asUpdateValidator(validateVmwareURL),
    () => 'vCenter Hostname'
  ),
};

export const validateVmwareProvider = vmSettings => {
  const update = {
    [PROVIDERS_DATA_KEY]: {},
  };

  Object.keys(vmSettings).forEach(key => {
    const validator = validateResolver[key];
    if (validator) {
      update[key] = validator(key, vmSettings);
    }
  });

  update[PROVIDERS_DATA_KEY][PROVIDER_VMWARE] = validateVmwareDataProvider(
    get(vmSettings, [PROVIDERS_DATA_KEY, PROVIDER_VMWARE])
  );

  return update; // do not merge send as update with vmSettings validation
};

export const validateVmwareDataProvider = providerData => {
  const update = {};

  Object.keys(providerData).forEach(key => {
    const validator = validateVMwareResolver[key];
    if (validator) {
      update[key] = validator(key, providerData);
    }
  });

  return objectMerge({}, providerData, update);
};

export const isVmwareProviderValid = (providerData, vmSettings) => {
  const keys = Object.keys(providerData);

  // check if all required fields are defined
  let valid = keys
    .filter(key => isObject(providerData[key]) && isFieldRequired(providerData[key]))
    .every(key => settingsValue(providerData, key));

  if (valid) {
    // check if all fields are valid
    valid = keys.every(key => get(providerData, [key, 'validation', 'type']) !== VALIDATION_ERROR_TYPE);
  }

  return valid;
};

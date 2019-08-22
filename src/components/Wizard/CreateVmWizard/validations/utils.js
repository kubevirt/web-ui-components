import { get } from 'lodash';

import { addMissingSubject } from '../../../../utils/grammar';

export const asGenericFieldValidator = (customValidator, getFieldTitle) => (key, vmSettings, additionalResources) => {
  const field = vmSettings[key] || {};
  const { validation, ...rest } = customValidator && customValidator(field.value, vmSettings, additionalResources);
  let val = validation;

  // next step is disabled by isValid so empty errors do not need to be shown
  if (get(val, 'isEmptyError')) {
    val = null;
  }

  if (val) {
    const title = getFieldTitle(key);
    if (title) {
      val.message = addMissingSubject(val.message, getFieldTitle(key));
    }
  }

  return {
    ...rest,
    validation: val === undefined ? null : val,
  };
};

export const asUpdateValidator = customValidator => (...values) => ({
  validation: customValidator(...values),
});

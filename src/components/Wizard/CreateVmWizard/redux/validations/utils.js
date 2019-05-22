import { get } from '../../../../../selectors';

export const asGenericFieldValidator = (customValidator, getFieldTitle) => (key, field, fields, props) => {
  const fieldValue = get(field, 'value');
  let validation = customValidator && customValidator(fieldValue, fields, props);

  // next step is disabled by isValid so empty errors do not need to be shown
  if (!fieldValue && get(validation, 'isEmptyError')) {
    validation = null;
  }

  if (validation) {
    const title = getFieldTitle(key);
    if (title) {
      validation.message = `${getFieldTitle(key)} ${validation.message}`;
    }
  }

  return validation === undefined ? null : validation;
};

export const getValidationUpdate = (config, options, fields, compareField) => {
  const { id, changedProps, prevState, props, getState } = options;
  const state = getState();

  return Object.keys(config).reduce((updateAcc, validationFieldKey) => {
    const { detectValueChanges, detectPropChanges, validator } = config[validationFieldKey];

    const needsValidationUpdate =
      (detectValueChanges && detectValueChanges.some(fieldKey => compareField(prevState, state, id, fieldKey))) ||
      (detectPropChanges && detectPropChanges.some(fieldKey => changedProps[fieldKey]));

    if (needsValidationUpdate) {
      const field = fields.get(validationFieldKey);
      const validation = validator(validationFieldKey, field, fields, props);
      // null -> value || oldValue -> null || oldValue -> value
      if (field.get('validation') || validation) {
        updateAcc[validationFieldKey] = { validation };
      }
    }
    return updateAcc;
  }, {});
};

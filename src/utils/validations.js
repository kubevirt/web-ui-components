import {
  DNS1123_START_ERROR,
  DNS1123_END_ERROR,
  DNS1123_CONTAINS_ERROR,
  DNS1123_EMPTY_ERROR,
  DNS1123_TOO_LONG_ERROR,
  DNS1123_UPPERCASE_ERROR,
} from './strings';
import { VALIDATION_ERROR_TYPE } from '../constants';

export const isPositiveNumber = value => value && value.match(/^[1-9]\d*$/);

const alphanumberincRegex = '[a-zA-Z0-9]';

export const getValidationObject = (message, type = VALIDATION_ERROR_TYPE) => ({
  message,
  type,
});

// DNS-1123 subdomain
export const validateDNS1123SubdomainValue = value => {
  if (!value) {
    return getValidationObject(DNS1123_EMPTY_ERROR);
  }
  if (value.toLowerCase() !== value) {
    return getValidationObject(DNS1123_UPPERCASE_ERROR);
  }
  if (value.length > 253) {
    return getValidationObject(DNS1123_TOO_LONG_ERROR);
  }
  if (!value.charAt(0).match(alphanumberincRegex)) {
    return getValidationObject(DNS1123_START_ERROR);
  }
  if (!value.charAt(value.length - 1).match(alphanumberincRegex)) {
    return getValidationObject(DNS1123_END_ERROR);
  }
  for (let i = 1; i < value.length - 1; i++) {
    if (!value.charAt(i).match('[-a-zA-Z0-9.]')) {
      return getValidationObject(`${DNS1123_CONTAINS_ERROR} ${value.charAt(i)}`);
    }
  }
  return null;
};

/* eslint-disable no-new */
import { trimStart, trimEnd } from 'lodash';

import {
  DNS1123_START_ERROR,
  DNS1123_END_ERROR,
  DNS1123_CONTAINS_ERROR,
  EMPTY_ERROR,
  DNS1123_TOO_LONG_ERROR,
  DNS1123_UPPERCASE_ERROR,
  URL_INVALID_ERROR,
  START_WHITESPACE_ERROR,
  END_WHITESPACE_ERROR,
  VMWARE_URL_ERROR,
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
    return getValidationObject(EMPTY_ERROR);
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

export const validateURL = value => {
  if (!value) {
    return getValidationObject(EMPTY_ERROR);
  }

  if (trimStart(value).length !== value.length) {
    return getValidationObject(START_WHITESPACE_ERROR);
  }

  if (trimEnd(value).length !== value.length) {
    return getValidationObject(END_WHITESPACE_ERROR);
  }
  try {
    new URL(value);
    return null;
  } catch {
    return getValidationObject(URL_INVALID_ERROR);
  }
};

export const validateContainer = value => {
  if (!value) {
    return getValidationObject(EMPTY_ERROR);
  }

  if (trimStart(value).length !== value.length) {
    return getValidationObject(START_WHITESPACE_ERROR);
  }

  if (trimEnd(value).length !== value.length) {
    return getValidationObject(END_WHITESPACE_ERROR);
  }

  return null;
};

export const validateVmwareURL = value => {
  if (!value) {
    return getValidationObject(EMPTY_ERROR);
  }

  if (trimStart(value).length !== value.length) {
    return getValidationObject(START_WHITESPACE_ERROR);
  }

  if (trimEnd(value).length !== value.length) {
    return getValidationObject(END_WHITESPACE_ERROR);
  }
  /* Protocol is added automatically by controller
  try {
    const u = new URL(value);
    if (!u.hostname) {
      return getValidationObject(VMWARE_URL_ERROR);
    }
  } catch {
    return getValidationObject(VMWARE_URL_ERROR);
  }
*/
  return null;
};

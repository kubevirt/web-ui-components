/* eslint-disable no-new */
import { get, trimStart, trimEnd } from 'lodash';

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
  VIRTUAL_MACHINE_EXISTS,
} from './strings';

import { parseUrl } from './utils';

import { VALIDATION_ERROR_TYPE } from '../constants';
import { getName, getNamespace } from '../selectors';
import { NAMESPACE_KEY, VIRTUAL_MACHINES_KEY } from '../components/Wizard/CreateVmWizard/constants';

export const isPositiveNumber = value => value && value.match(/^[1-9]\d*$/);

const alphanumberincRegex = '[a-zA-Z0-9]';

export const getValidationObject = (message, type = VALIDATION_ERROR_TYPE) => ({
  message,
  type,
  isEmptyError: message === EMPTY_ERROR,
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
    const char = value.charAt(i);
    if (!char.match('[-a-zA-Z0-9.]')) {
      const offender = char.match('\\s') ? 'whitespace characters' : char;
      return getValidationObject(`${DNS1123_CONTAINS_ERROR} ${offender}`);
    }
  }
  return null;
};

const vmAlreadyExists = (name, namespace, vms) => {
  const exists = vms && vms.some(vm => getName(vm) === name && getNamespace(vm) === namespace);
  return exists ? getValidationObject(VIRTUAL_MACHINE_EXISTS) : null;
};

export const validateVmName = (value, vmSettings, props) => {
  const namespace = get(vmSettings, `${NAMESPACE_KEY}.value`);
  const dnsValidation = validateDNS1123SubdomainValue(value);
  return dnsValidation && dnsValidation.type === VALIDATION_ERROR_TYPE
    ? dnsValidation
    : vmAlreadyExists(value, namespace, props[VIRTUAL_MACHINES_KEY]);
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

  return parseUrl(value) ? null : getValidationObject(URL_INVALID_ERROR);
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

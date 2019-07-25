/* eslint-disable no-new */
import { get, startsWith, trimStart, trimEnd } from 'lodash';

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
  BMC_PROTOCOL_ERROR,
  BMC_PORT_ERROR,
  VIRTUAL_MACHINE_EXISTS,
  VIRTUAL_MACHINE_TEMPLATE_EXISTS,
} from './strings';

import { parseUrl } from './utils';

import { VALIDATION_ERROR_TYPE, METALKUBE_CONTROLLER_PROTOCOLS, TEMPLATE_TYPE_VM } from '../constants';
import { getName, getNamespace } from '../selectors';
import {
  CREATE_TEMPLATE_KEY,
  DATAVOLUMES_KEY,
  NAMESPACE_KEY,
  TEMPLATES_KEY,
  VIRTUAL_MACHINES_KEY,
} from '../components/Wizard/CreateVmWizard/constants';
import { getTemplate, getTemplateProvisionSource } from './templates';

export const isPositiveNumber = value => value && value.toString().match(/^[1-9]\d*$/);

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
    if (!char.match('[-a-zA-Z0-9]')) {
      const offender = char.match('\\s') ? 'whitespace characters' : char;
      return getValidationObject(`${DNS1123_CONTAINS_ERROR} ${offender}`);
    }
  }
  return null;
};

export const entityAlreadyExists = (name, namespace, entities, errorMessage = VIRTUAL_MACHINE_EXISTS) => {
  const exists = entities && entities.some(entity => getName(entity) === name && getNamespace(entity) === namespace);
  return exists ? getValidationObject(errorMessage) : null;
};

export const validateVmLikeEntityName = (value, vmSettings, props) => {
  const dnsValidation = validateDNS1123SubdomainValue(value);
  const isCreateTemplate = props[CREATE_TEMPLATE_KEY];

  return dnsValidation && dnsValidation.type === VALIDATION_ERROR_TYPE
    ? dnsValidation
    : entityAlreadyExists(
        value,
        get(vmSettings, `${NAMESPACE_KEY}.value`),
        props[isCreateTemplate ? TEMPLATES_KEY : VIRTUAL_MACHINES_KEY],
        isCreateTemplate ? VIRTUAL_MACHINE_TEMPLATE_EXISTS : VIRTUAL_MACHINE_EXISTS
      );
};

export const validateUserTemplate = (userTemplateKey, vmSettings, props) => {
  const userTemplateName = get(vmSettings, [userTemplateKey, 'value']);
  const userTemplate =
    userTemplateName &&
    getTemplate(props[TEMPLATES_KEY], TEMPLATE_TYPE_VM).find(template => getName(template) === userTemplateName);

  const provisionSource = userTemplate && getTemplateProvisionSource(userTemplate, props[DATAVOLUMES_KEY]);

  return {
    validation:
      provisionSource && provisionSource.error
        ? getValidationObject(`Could not select Provision Source. ${provisionSource.error}`)
        : null,
  };
};

export const validateMemory = value => {
  if (!value) {
    return getValidationObject(EMPTY_ERROR);
  }
  return isPositiveNumber(value) ? null : getValidationObject('must be positive integer');
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

// <protocol>://<host>:<port>
//
// "protocol" is optional, defaults to "ipmi"
// "host" is a hostname or an IP address
// "port" is optional

export const validateBmcURL = value => {
  if (!value) {
    return getValidationObject(EMPTY_ERROR);
  }

  const hasProtocol = value.includes('://');
  const hasPort = value.match(':(?!/)');

  if (hasProtocol && !METALKUBE_CONTROLLER_PROTOCOLS.find(allowedProtocol => startsWith(value, allowedProtocol))) {
    return getValidationObject(BMC_PROTOCOL_ERROR);
  }

  if (hasPort && !value.match(/:\d+/)) {
    return getValidationObject(BMC_PORT_ERROR);
  }

  if (!hasProtocol) {
    value = `ipmi://${value}`;
  }

  return validateURL(value);
};

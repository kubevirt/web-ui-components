/* eslint-disable no-new */
import { get, startsWith, trimStart, trimEnd } from 'lodash';

import {
  DNS1123_START_ERROR,
  DNS1123_END_ERROR,
  EMPTY_ERROR,
  DNS1123_START_END_ERROR,
  DNS1123_TOO_LONG_ERROR,
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
import { joinGrammaticallyListOfItems, makeSentence } from './grammar';

export const isPositiveNumber = value => value && value.toString().match(/^[1-9]\d*$/);

export const alphanumericRegex = '[a-zA-Z0-9]';

const DNS_1123_OFFENDING_CHARACTERS = {
  ',': 'comma',
  "'": 'apostrophe', // eslint-disable-line quotes
  _: 'underscore',
};

export const getValidationObject = (message, type = VALIDATION_ERROR_TYPE) => ({
  message,
  type,
  isEmptyError: message.includes(EMPTY_ERROR),
});

// DNS-1123 subdomain
export const validateDNS1123SubdomainValue = value => {
  if (!value) {
    return getValidationObject(makeSentence(EMPTY_ERROR, false)); // handled by UI
  }

  const forbiddenCharacters = new Set();
  const validationSentences = [];

  if (value.length > 253) {
    validationSentences.push(DNS1123_TOO_LONG_ERROR);
  }

  const startsWithAlphaNumeric = value.charAt(0).match(alphanumericRegex);
  const endsWithAlphaNumeric = value.charAt(value.length - 1).match(alphanumericRegex);

  if (!startsWithAlphaNumeric && !endsWithAlphaNumeric) {
    validationSentences.push(DNS1123_START_END_ERROR);
  } else if (!startsWithAlphaNumeric) {
    validationSentences.push(DNS1123_START_ERROR);
  } else if (!endsWithAlphaNumeric) {
    validationSentences.push(DNS1123_END_ERROR);
  }

  for (const c of value) {
    if (c.toLowerCase() !== c) {
      forbiddenCharacters.add('uppercase');
    }

    if (!c.match('[-a-zA-Z0-9]')) {
      let offender;
      if (c.match('\\s')) {
        offender = 'whitespace';
      } else {
        offender = DNS_1123_OFFENDING_CHARACTERS[c] || `'${c}'`;
      }

      forbiddenCharacters.add(offender);
    }
  }

  let result = null;

  if (validationSentences.length > 0) {
    result = makeSentence(joinGrammaticallyListOfItems(validationSentences), false);
  }

  if (forbiddenCharacters.size > 0) {
    const forbiddenChars = joinGrammaticallyListOfItems(
      Array.from(forbiddenCharacters).sort((a, b) => b.length - a.length)
    );
    const forbiddenCharsSentence = makeSentence(`${forbiddenChars} characters are not allowed`);
    result = result ? `${result} ${forbiddenCharsSentence}` : forbiddenCharsSentence;
  }

  return result && getValidationObject(result);
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

export const validateCloudInitHostName = value => {
  const dnsValidation = validateDNS1123SubdomainValue(value);
  return dnsValidation && dnsValidation.isEmptyError ? null : dnsValidation;
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

const HEXCH_REGEX = '[0-9A-Fa-f]';
const MAC_REGEX_COLON_DELIMITER = new RegExp(
  `^((${HEXCH_REGEX}{2}[:]){19}${HEXCH_REGEX}{2})$|` + // 01:23:45:67:89:ab:cd:ef:00:00:01:23:45:67:89:ab:cd:ef:00:00
  `^((${HEXCH_REGEX}{2}[:]){7}${HEXCH_REGEX}{2})$|` + // 01:23:45:67:89:ab:cd:ef
    `^((${HEXCH_REGEX}{2}[:]){5}${HEXCH_REGEX}{2})$` // 01:23:45:67:89:ab
);

const MAC_REGEX_DASH_DELIMITER = new RegExp(
  `^((${HEXCH_REGEX}{2}[-]){19}${HEXCH_REGEX}{2})$|` + // 01-23-45-67-89-ab-cd-ef-00-00-01-23-45-67-89-ab-cd-ef-00-00
  `^((${HEXCH_REGEX}{2}[-]){7}${HEXCH_REGEX}{2})$|` + // 01-23-45-67-89-ab-cd-ef
    `^((${HEXCH_REGEX}{2}[-]){5}${HEXCH_REGEX}{2})$` // 01-23-45-67-89-ab
);

const MAC_REGEX_PERIOD_DELIMITER = new RegExp(
  `^((${HEXCH_REGEX}{4}.){9}${HEXCH_REGEX}{4})$|` + // 0123.4567.89ab.cdef.0000.0123.4567.89ab.cdef.0000
  `^((${HEXCH_REGEX}{4}.){3}${HEXCH_REGEX}{4})$|` + // 0123.4567.89ab.cdef
    `^((${HEXCH_REGEX}{4}.){2}${HEXCH_REGEX}{4})$` // 0123.4567.89ab
);

const COLON_DELIMITER = ':';
const DASH_DELIMITER = '-';
const PERIOD_DELIMITER = '.';

// Validates that the provided MAC address meets one of following formats supported by the golang ParseMAC function:
// IEEE 802 MAC-48, EUI-48, EUI-64, or a 20-octet IP over InfiniBand link-layer address
// https://golang.org/pkg/net/#ParseMAC
export const isValidMAC = mac => {
  if (mac.length < 14) {
    return false;
  }

  let regex;
  if (mac[2] === COLON_DELIMITER) {
    regex = MAC_REGEX_COLON_DELIMITER;
  } else if (mac[2] === DASH_DELIMITER) {
    regex = MAC_REGEX_DASH_DELIMITER;
  } else if (mac[4] === PERIOD_DELIMITER) {
    regex = MAC_REGEX_PERIOD_DELIMITER;
  }

  return regex ? regex.test(mac) : false;
};

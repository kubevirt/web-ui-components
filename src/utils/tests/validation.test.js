import {
  isPositiveNumber,
  validateDNS1123SubdomainValue,
  validateURL,
  validateContainer,
  getValidationObject,
  validateVmwareURL,
  validateBmcURL,
  validateVmName,
} from '../validations';
import {
  DNS1123_START_ERROR,
  DNS1123_END_ERROR,
  DNS1123_CONTAINS_ERROR,
  EMPTY_ERROR,
  DNS1123_TOO_LONG_ERROR,
  DNS1123_UPPERCASE_ERROR,
  URL_INVALID_ERROR,
  END_WHITESPACE_ERROR,
  START_WHITESPACE_ERROR,
  BMC_PROTOCOL_ERROR,
  BMC_PORT_ERROR,
  VIRTUAL_MACHINE_EXISTS,
} from '../strings';
import { vm1, vm2 } from '../../tests/mocks/vm/vm_validation.mock';

const validatesEmpty = validateFunction => {
  expect(validateFunction('')).toEqual(getValidationObject(EMPTY_ERROR));
  expect(validateFunction(null)).toEqual(getValidationObject(EMPTY_ERROR));
  expect(validateFunction(undefined)).toEqual(getValidationObject(EMPTY_ERROR));
};

describe('validation.js - isPositiveNumber tests', () => {
  it('returns false for NaN', () => {
    expect(isPositiveNumber('abc')).toBeFalsy();
  });
  it('returns false for undefined and null', () => {
    expect(isPositiveNumber()).toBeFalsy();
    expect(isPositiveNumber(null)).toBeFalsy();
  });
  it('returns false for negative number', () => {
    expect(isPositiveNumber('-1')).toBeFalsy();
  });
  it('returns false for 0', () => {
    expect(isPositiveNumber('0')).toBeFalsy();
  });
  it('returns false for float', () => {
    expect(isPositiveNumber('1.2')).toBeFalsy();
    expect(isPositiveNumber('1,2')).toBeFalsy();
  });
  it('returns true for positive number', () => {
    expect(isPositiveNumber('1')).toBeTruthy();
  });
});

describe('validation.js - validateDNS1123SubdomainValue tests', () => {
  it('returns undefined for valid value', () => {
    expect(validateDNS1123SubdomainValue('abc')).toBeNull();
    expect(validateDNS1123SubdomainValue('1abc')).toBeNull();
    expect(validateDNS1123SubdomainValue('aab-c')).toBeNull();
    expect(validateDNS1123SubdomainValue('aa.bc')).toBeNull();
    expect(validateDNS1123SubdomainValue('a'.repeat(253))).toBeNull();
  });
  it('returns warning for uppercase value', () => {
    expect(validateDNS1123SubdomainValue('Aabc')).toEqual(getValidationObject(DNS1123_UPPERCASE_ERROR));
  });
  it('returns message for too long value', () => {
    expect(validateDNS1123SubdomainValue('a'.repeat(254))).toEqual(getValidationObject(DNS1123_TOO_LONG_ERROR));
  });
  it('returns message for empty value', () => {
    validatesEmpty(validateDNS1123SubdomainValue);
  });
  it('returns message for value which starts with invalid char', () => {
    expect(validateDNS1123SubdomainValue('_abc')).toEqual(getValidationObject(DNS1123_START_ERROR));
    expect(validateDNS1123SubdomainValue('.abc')).toEqual(getValidationObject(DNS1123_START_ERROR));
    expect(validateDNS1123SubdomainValue('-abc')).toEqual(getValidationObject(DNS1123_START_ERROR));
  });
  it('returns message for value which ends with invalid char', () => {
    expect(validateDNS1123SubdomainValue('abc_')).toEqual(getValidationObject(DNS1123_END_ERROR));
    expect(validateDNS1123SubdomainValue('abc.')).toEqual(getValidationObject(DNS1123_END_ERROR));
    expect(validateDNS1123SubdomainValue('abc-')).toEqual(getValidationObject(DNS1123_END_ERROR));
  });
  it('returns message for value which contains invalid char', () => {
    expect(validateDNS1123SubdomainValue('ab_c')).toEqual(getValidationObject(`${DNS1123_CONTAINS_ERROR} _`));
    expect(validateDNS1123SubdomainValue('ab/c')).toEqual(getValidationObject(`${DNS1123_CONTAINS_ERROR} /`));
    expect(validateDNS1123SubdomainValue('ab*c')).toEqual(getValidationObject(`${DNS1123_CONTAINS_ERROR} *`));
  });
});

describe('validation.js - validateURL tests', () => {
  it('returns undefined for valid value', () => {
    expect(validateURL('http://hello.com')).toBeNull();
    expect(validateURL('http://hello.com/path/to/iso?aa=5&n=a')).toBeNull();
  });
  it('returns message for empty value', () => {
    validatesEmpty(validateURL);
  });
  it('returns message for value which starts or ends with whitespace character', () => {
    expect(validateURL(' http://hello.com')).toEqual(getValidationObject(START_WHITESPACE_ERROR));
    expect(validateURL('http://hello.com ')).toEqual(getValidationObject(END_WHITESPACE_ERROR));
  });
  it('returns message for invalid url', () => {
    expect(validateURL('abc')).toEqual(getValidationObject(URL_INVALID_ERROR));
    expect(validateURL('http://')).toEqual(getValidationObject(URL_INVALID_ERROR));
  });
});

describe('validation.js - validateContainer tests', () => {
  it('returns undefined for valid value', () => {
    expect(validateContainer('kubevirt/fedora-cloud-registry-disk-demo')).toBeNull();
  });
  it('returns message for empty value', () => {
    validatesEmpty(validateContainer);
  });
  it('returns message for value which starts or ends with whitespace character', () => {
    expect(validateContainer(' kubevirt/fedora-cloud-registry-disk-demo')).toEqual(
      getValidationObject(START_WHITESPACE_ERROR)
    );
    expect(validateContainer('kubevirt/fedora-cloud-registry-disk-demo ')).toEqual(
      getValidationObject(END_WHITESPACE_ERROR)
    );
  });
});

describe('validation.js - validateVmwareURL', () => {
  it('handles empty input', () => {
    validatesEmpty(validateVmwareURL);
  });
  it('handles whitespaces at start or end', () => {
    expect(validateVmwareURL(' http://hello.com')).toEqual(getValidationObject(START_WHITESPACE_ERROR));
    expect(validateVmwareURL('http://hello.com ')).toEqual(getValidationObject(END_WHITESPACE_ERROR));
  });
});

describe('validation.js - validateBmcURL', () => {
  it('handles empty input', () => {
    validatesEmpty(validateBmcURL);
  });

  it('starts with the correct protocol', () => {
    expect(validateBmcURL('ipmi://1.2.3.4:1234')).toBeNull();
    expect(validateBmcURL('idrac://1.2.3.4:1234')).toBeNull();
    expect(validateBmcURL('http://1.2.3.4:1234')).toEqual(getValidationObject(BMC_PROTOCOL_ERROR));
  });

  it('uses a numerical port', () => {
    expect(validateBmcURL('1.2.3.4:9000')).toBeNull();
    expect(validateBmcURL('ipmi://1.2.3.4:9000')).toBeNull();
    expect(validateBmcURL('1.2.3.4:abc')).toEqual(getValidationObject(BMC_PORT_ERROR));
    expect(validateBmcURL('ipmi://1.2.3.4:abc')).toEqual(getValidationObject(BMC_PORT_ERROR));
  });

  it('uses a valid hostname', () => {
    expect(validateBmcURL('1.2.3.4')).toBeNull();
    expect(validateBmcURL('example.com')).toBeNull();
    expect(validateBmcURL('@@@@')).toEqual(getValidationObject(URL_INVALID_ERROR));
  });
});

describe('validation.js - validateVmName', () => {
  it('handles unique name', () => {
    expect(validateVmName('vm3', 'test-namespace', [vm1, vm2])).toBeNull();
  });

  it('handles duplicate name', () => {
    expect(validateVmName('vm1', 'test-namespace', [vm1, vm2])).toEqual(getValidationObject(VIRTUAL_MACHINE_EXISTS));
  });
});

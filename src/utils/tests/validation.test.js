import { isPositiveNumber, validateDNS1123SubdomainValue, getValidationObject } from '../validations';
import {
  DNS1123_START_ERROR,
  DNS1123_END_ERROR,
  DNS1123_CONTAINS_ERROR,
  DNS1123_EMPTY_ERROR,
  DNS1123_TOO_LONG_ERROR,
  DNS1123_UPPERCASE_ERROR,
} from '../strings';

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
    expect(validateDNS1123SubdomainValue('')).toEqual(getValidationObject(DNS1123_EMPTY_ERROR));
    expect(validateDNS1123SubdomainValue(null)).toEqual(getValidationObject(DNS1123_EMPTY_ERROR));
    expect(validateDNS1123SubdomainValue(undefined)).toEqual(getValidationObject(DNS1123_EMPTY_ERROR));
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

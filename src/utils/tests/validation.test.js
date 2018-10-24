import { isPositiveNumber } from '../validations';

describe('validation.js tests', () => {
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

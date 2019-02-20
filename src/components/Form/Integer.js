import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, noop } from 'patternfly-react';

import { eventValueHandler } from './utils';
import { getSequence, setNativeValue } from '../../utils/utils';
import { isMinus, KEY_CODES, INPUT_NAVIGATION_KEYS } from '../../constants/keys';

const NON_NEGATIVE_INTEGER_KEYS = [
  ...INPUT_NAVIGATION_KEYS,
  ...getSequence(KEY_CODES[0], KEY_CODES[9]),
  ...getSequence(KEY_CODES.NUMPAD[0], KEY_CODES.NUMPAD[9]),
];

const INTEGER_KEYS = [...NON_NEGATIVE_INTEGER_KEYS, KEY_CODES.MINUS, KEY_CODES.HYPHEN_MINUS, KEY_CODES.NUMPAD.SUBTRACT];

const POSITIVE_INT_REGEX = /^[1-9]\d*$/;
const NON_NEGATIVE_INT_REGEX = /^(0|[1-9]\d*)$/;
const INT_REGEX = /^(-?0|-?[1-9]\d*)$/;

const PRECEEDING_ZEROS_POSITIVE_INT_REGEX = /^0*([1-9]\d*)$/;
const PRECEEDING_ZEROS_INT_REGEX = /^(-?)0*([1-9]\d*)$/;

const fixPrecedingZerosPositiveInt = value => {
  const match = PRECEEDING_ZEROS_POSITIVE_INT_REGEX.exec(value);
  return match && match.length === 2 ? match[1] : '';
};

const fixPrecedingZerosNonNegativeInt = value => {
  const match = PRECEEDING_ZEROS_POSITIVE_INT_REGEX.exec(value);
  return match && match.length === 2 ? match[1] : '0';
};

const fixInt = (value, oldValue, keyCode) => {
  if (value.length === 0 && isMinus(keyCode)) {
    if (oldValue) {
      return oldValue < 0 || oldValue === '-0' ? oldValue : `-${oldValue}`;
    }
    return '-0';
  }

  const match = PRECEEDING_ZEROS_INT_REGEX.exec(value);
  if (match && match.length === 3) {
    if (match[1]) {
      return `${match[1]}${match[2]}`;
    }
    return match[2];
  }
  return '0';
};

const isInputValid = (allowedKeys, keyCode, targetValue, additionalValidation) => {
  if (allowedKeys.includes(keyCode)) {
    return additionalValidation ? additionalValidation(keyCode, targetValue) : true;
  }
  return false;
};

export const Integer = ({ id, value, disabled, defaultValue, onChange, onBlur, positive, nonNegative, className }) => {
  let allowedKeys;
  let validRegex;
  let fixAfterValue;
  let min;
  let additionalValidation;

  if (positive) {
    allowedKeys = NON_NEGATIVE_INTEGER_KEYS;
    validRegex = POSITIVE_INT_REGEX;
    fixAfterValue = fixPrecedingZerosPositiveInt;
    min = 1;
    additionalValidation = (keyCode, targetValue) =>
      !(targetValue === '' && (keyCode === KEY_CODES[0] || keyCode === KEY_CODES.NUMPAD[0]));
  } else if (nonNegative) {
    allowedKeys = NON_NEGATIVE_INTEGER_KEYS;
    validRegex = NON_NEGATIVE_INT_REGEX;
    fixAfterValue = fixPrecedingZerosNonNegativeInt;
    min = 0;
  } else {
    allowedKeys = INTEGER_KEYS;
    validRegex = INT_REGEX;
    fixAfterValue = fixInt;
  }

  const onKeydown = e => {
    const { keyCode, target } = e;

    if (!isInputValid(allowedKeys, keyCode, target.value, additionalValidation)) {
      e.preventDefault();
      return false;
    }

    const oldValue = target.value;

    window.setTimeout(() => {
      if (!validRegex.test(target.value)) {
        const v = fixAfterValue(target.value, oldValue, keyCode);
        setNativeValue(target, v);
        target.dispatchEvent(
          new Event('input', {
            bubbles: true,
            cancelable: true,
          })
        );
      }
    }, 0);
    return true;
  };

  return (
    <FormControl
      id={id}
      type="number"
      onKeyDown={onKeydown}
      min={min}
      value={value}
      defaultValue={defaultValue}
      onBlur={eventValueHandler(onBlur)}
      onChange={eventValueHandler(onChange)}
      className={className}
      disabled={disabled}
    />
  );
};

Integer.defaultProps = {
  value: undefined,
  defaultValue: undefined,
  onChange: noop,
  onBlur: noop,
  positive: false,
  nonNegative: false, // is ignored when positive == true
  className: undefined,
  disabled: false,
};

Integer.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  positive: PropTypes.bool,
  nonNegative: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

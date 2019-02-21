import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, noop } from 'patternfly-react';

import { eventValueHandler } from './utils';

export const Text = ({ id, value, disabled, defaultValue, onChange, onBlur, type, className }) => (
  <FormControl
    id={id}
    key={id}
    type={type}
    value={value}
    defaultValue={defaultValue}
    onBlur={eventValueHandler(onBlur)}
    onChange={eventValueHandler(onChange)}
    className={className}
    disabled={disabled}
  />
);

Text.defaultProps = {
  value: undefined,
  defaultValue: undefined,
  onChange: noop,
  onBlur: noop,
  disabled: false,
  className: undefined,
  type: 'text', // or password
};

Text.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'patternfly-react';
import { eventValueHandler } from './utils';

export const Text = ({ id, value, disabled, defaultValue, onChange, onBlur }) => (
  <FormControl
    id={id}
    key={id}
    type="text"
    value={value}
    defaultValue={defaultValue}
    onBlur={eventValueHandler(onBlur)}
    onChange={eventValueHandler(onChange)}
    disabled={disabled}
  />
);

Text.defaultProps = {
  id: undefined,
  value: undefined,
  defaultValue: undefined,
  onChange: undefined,
  onBlur: undefined,
  disabled: false,
};

Text.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
};

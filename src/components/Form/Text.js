import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, noop } from 'patternfly-react';

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
  value: undefined,
  defaultValue: undefined,
  onChange: noop,
  onBlur: noop,
  disabled: false,
};

Text.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
};

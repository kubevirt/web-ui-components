import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'patternfly-react';
import { eventValueHandler } from './utils';

export const TextArea = ({ id, value, disabled, defaultValue, onChange, onBlur }) => (
  <FormControl
    id={id}
    componentClass="textarea"
    value={value}
    defaultValue={defaultValue}
    onBlur={eventValueHandler(onBlur)}
    onChange={eventValueHandler(onChange)}
    disabled={disabled}
  />
);

TextArea.defaultProps = {
  id: undefined,
  value: undefined,
  defaultValue: undefined,
  onChange: undefined,
  onBlur: undefined,
  disabled: false,
};

TextArea.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
};

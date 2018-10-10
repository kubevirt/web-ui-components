import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'patternfly-react';
import { eventValueHandler } from './utils';

export const Text = ({ id, value, defaultValue, onChange, onBlur }) => (
  <FormControl
    type="text"
    value={value}
    defaultValue={defaultValue}
    onBlur={eventValueHandler(onBlur)}
    onChange={eventValueHandler(onChange)}
  />
);

Text.defaultProps = {
  id: undefined,
  value: undefined,
  defaultValue: undefined,
  onChange: undefined,
  onBlur: undefined
};

Text.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

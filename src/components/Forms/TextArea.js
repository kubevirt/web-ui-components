import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'patternfly-react';
import { eventValueHandler } from './utils';

export const TextArea = ({ id, value, defaultValue, onChange, onBlur }) => (
  <FormControl
    componentClass="textarea"
    value={value}
    defaultValue={defaultValue}
    onBlur={eventValueHandler(onBlur)}
    onChange={eventValueHandler(onChange)}
  />
);

TextArea.defaultProps = {
  id: undefined,
  value: undefined,
  defaultValue: undefined,
  onChange: undefined,
  onBlur: undefined
};

TextArea.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

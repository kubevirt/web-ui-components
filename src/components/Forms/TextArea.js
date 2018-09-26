import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'patternfly-react';

export const TextArea = ({ fieldKey, value, onChange }) => (
  <FormControl componentClass="textarea" value={value} onChange={event => onChange(event.target.value, fieldKey)} />
);

TextArea.propTypes = {
  fieldKey: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'patternfly-react';

export const Text = ({ fieldKey, value, onChange }) => (
  <FormControl type="text" value={value} onChange={event => onChange(event.target.value, fieldKey)} />
);

Text.propTypes = {
  fieldKey: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox as PfCheckbox } from 'patternfly-react';

export const Checkbox = ({ fieldKey, checked, title, onChange }) => (
  <PfCheckbox checked={checked} onChange={event => onChange(event.target.checked, fieldKey)}>
    {title}
  </PfCheckbox>
);

Checkbox.propTypes = {
  fieldKey: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

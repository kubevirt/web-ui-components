import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox as PfCheckbox } from 'patternfly-react';
import { checkboxHandler } from './utils';

export const Checkbox = ({ id, title, disabled, checked, onChange, onBlur }) => (
  <PfCheckbox
    id={id}
    checked={checked}
    onBlur={checkboxHandler(onBlur)}
    onChange={checkboxHandler(onChange)}
    disabled={disabled}
  >
    {title}
  </PfCheckbox>
);

Checkbox.defaultProps = {
  id: undefined,
  title: '',
  checked: false,
  onChange: undefined,
  onBlur: undefined,
  disabled: false,
};

Checkbox.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
};

import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, MenuItem } from 'patternfly-react';
import { valueHandler } from './utils';

export const Dropdown = ({ id, value, disabled, onChange, onBlur, choices }) => (
  <ButtonGroup justified key={id} className="kubevirt-dropdownGroup">
    <DropdownButton
      id={id}
      bsStyle="default"
      className="kubevirt-dropdown"
      title={value}
      onSelect={valueHandler(onChange)}
      onBlur={valueHandler(onBlur)}
      disabled={disabled}
    >
      {choices.map(choice => {
        const isObject = typeof choice === 'object';
        const key = isObject ? choice.id || choice.name : choice;
        const val = isObject ? choice.name : choice;

        return (
          <MenuItem key={key} eventKey={key}>
            {val}
          </MenuItem>
        );
      })}
    </DropdownButton>
  </ButtonGroup>
);

Dropdown.defaultProps = {
  id: null,
  onChange: null,
  onBlur: null,
  disabled: false,
};

Dropdown.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string.isRequired,
  choices: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
};

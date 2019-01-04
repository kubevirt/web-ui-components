import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, MenuItem, noop } from 'patternfly-react';

export const Dropdown = ({ id, value, disabled, onChange, onBlur, choices }) => (
  <ButtonGroup justified key={id}>
    <DropdownButton
      id={id}
      bsStyle="default"
      className="kubevirt-dropdown"
      title={value}
      onSelect={onChange}
      onBlur={onBlur}
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
  onChange: noop,
  onBlur: noop,
  disabled: false,
};

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  choices: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
};

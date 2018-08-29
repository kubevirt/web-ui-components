import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, MenuItem } from 'patternfly-react';

export const Dropdown = ({ fieldKey, value, choices, onChange }) => (
  <ButtonGroup justified>
    <DropdownButton
      id={`dropdown-${fieldKey}`}
      bsStyle="default"
      className="form-dropdown"
      title={value}
      onSelect={v => onChange(v, fieldKey)}
    >
      {choices.map(choice => (
        <MenuItem key={choice} eventKey={choice}>
          {choice}
        </MenuItem>
      ))}
    </DropdownButton>
  </ButtonGroup>
);

Dropdown.propTypes = {
  fieldKey: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  choices: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

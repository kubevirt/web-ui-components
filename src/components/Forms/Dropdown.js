import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, MenuItem } from 'patternfly-react';
import { valueHandler } from './utils';

export const Dropdown = ({ id, value, onChange, onBlur, choices }) => (
  <ButtonGroup justified key={id}>
    <DropdownButton
      id={id}
      bsStyle="default"
      className="form-dropdown"
      title={value}
      onSelect={valueHandler(onChange)}
      onBlur={valueHandler(onBlur)}
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
  onBlur: null
};

Dropdown.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string.isRequired,
  choices: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

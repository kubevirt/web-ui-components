import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, MenuItem, noop, Tooltip, OverlayTrigger } from 'patternfly-react';

export const Dropdown = ({ id, value, disabled, onChange, choices, withTooltips }) => {
  const title = typeof value === 'object' ? value.name || value.id : value;
  return (
    <ButtonGroup justified key={id}>
      <DropdownButton
        id={id}
        bsStyle="default"
        className="kubevirt-dropdown"
        title={title}
        disabled={disabled}
        onSelect={onChange}
      >
        {choices.map(choice => {
          const isObject = typeof choice === 'object';
          const key = isObject ? choice.id || choice.name : choice;
          const val = isObject ? choice.name : choice;

          const content = (
            <MenuItem key={key} eventKey={choice}>
              {val}
            </MenuItem>
          );

          if (withTooltips) {
            const tooltip = <Tooltip id={`tooltip-${key}`}>{val}</Tooltip>;
            return (
              <OverlayTrigger key={key} overlay={tooltip} placement="top">
                {content}
              </OverlayTrigger>
            );
          }
          return content;
        })}
      </DropdownButton>
    </ButtonGroup>
  );
};

Dropdown.defaultProps = {
  onChange: noop,
  disabled: false,
  choices: [],
  withTooltips: false,
};

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  choices: PropTypes.array,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  withTooltips: PropTypes.bool,
};

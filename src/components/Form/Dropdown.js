import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ButtonGroup, DropdownButton, MenuItem, noop, Tooltip, OverlayTrigger } from 'patternfly-react';

import { get } from '../../selectors';

export const Dropdown = ({ id, value, disabled, onChange, choices, className, withTooltips, groupClassName }) => {
  const title = get(value, 'name') || get(value, 'id') || value;
  return (
    <ButtonGroup justified key={id} className={groupClassName}>
      <DropdownButton
        id={id}
        bsStyle="default"
        className={classNames('kubevirt-dropdown', className)}
        title={title}
        disabled={disabled}
        onSelect={onChange}
      >
        {choices.map(choice => {
          const key = get(choice, 'id') || get(choice, 'name') || choice;
          const val = get(choice, 'name') || choice;

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
  className: undefined,
  withTooltips: false,
  groupClassName: undefined,
};

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  choices: PropTypes.oneOfType([PropTypes.array, PropTypes.object]), // iterable
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  withTooltips: PropTypes.bool,
  groupClassName: PropTypes.string,
};

import React from 'react';
import { isObject } from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ButtonGroup, noop } from 'patternfly-react';
import { Dropdown as PFDropdown, DropdownToggle, DropdownItem } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

export const Dropdown = ({ id, value, disabled, onChange, choices, className, withTooltips, groupClassName }) => {
  const title = isObject(value) ? value.name || value.id : value;

  const [isOpen, setOpen] = React.useState(false);
  const toggle = (
    <DropdownToggle onToggle={() => setOpen(!isOpen)} iconComponent={CaretDownIcon} isDisabled={disabled}>
      {title}
    </DropdownToggle>
  );
  const dropdownItems = choices.map(choice => {
    const key = isObject(choice) ? choice.id || choice.name : choice;
    const val = isObject(choice) ? choice.name : choice;

    const tooltip = withTooltips ? val : undefined;
    const onClick = () => {
      setOpen(false);
      onChange(choice);
    };

    const content = (
      <DropdownItem key={key} onClick={onClick} tooltip={tooltip}>
        {val}
      </DropdownItem>
    );

    return content;
  });

  return (
    <ButtonGroup justified key={id} className={groupClassName}>
      <PFDropdown
        toggle={toggle}
        isOpen={isOpen}
        dropdownItems={dropdownItems}
        className={classNames('kubevirt-dropdown', className)}
      />
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
  choices: PropTypes.array,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  withTooltips: PropTypes.bool,
  groupClassName: PropTypes.string,
};

import React from 'react';
import { isObject } from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ButtonGroup, noop } from 'patternfly-react';
import { Dropdown as PFDropdown, DropdownToggle, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

export const Dropdown = ({
  id,
  value,
  disabled,
  onChange,
  choices,
  className,
  withTooltips,
  groupClassName,
  isKebab,
}) => {
  const [isOpen, setOpen] = React.useState(false);

  const onToggle = () => setOpen(!isOpen);
  let toggle;
  if (isKebab) {
    toggle = <KebabToggle onToggle={onToggle} isDisabled={disabled} />;
  } else {
    const title = isObject(value) ? value.name || value.id : value;
    toggle = (
      <DropdownToggle onToggle={onToggle} iconComponent={CaretDownIcon} isDisabled={disabled}>
        {title}
      </DropdownToggle>
    );
  }

  const dropdownItems = choices.map(choice => {
    const key = isObject(choice) ? choice.id || choice.name : choice;
    const val = isObject(choice) ? choice.name : choice;

    const tooltip = withTooltips ? val : undefined;
    const onClick = event => {
      setOpen(false);
      if (isObject(choice) && choice.onSelect) {
        choice.onSelect(event);
      }
      onChange(choice); // single per dropdown, default noop
    };

    const content = (
      <DropdownItem key={key} onClick={onClick} tooltip={tooltip}>
        {val}
      </DropdownItem>
    );

    return content;
  });

  const dropdown = (
    <PFDropdown
      toggle={toggle}
      isOpen={isOpen}
      dropdownItems={dropdownItems}
      className={classNames('kubevirt-dropdown', className)}
    />
  );

  return isKebab ? (
    dropdown
  ) : (
    <ButtonGroup justified key={id} className={groupClassName}>
      {dropdown}
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
  isKebab: false,
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
  isKebab: PropTypes.bool,
};

import React from 'react';
import PropTypes from 'prop-types';
import { TypeAheadSelect, noop } from 'patternfly-react';
import { isArray } from 'lodash';

export const TypeAhead = ({
  id,
  labelKey,
  defaultValue,
  placeholder,
  choices,
  multiple,
  selected,
  onChange,
  onBlur,
  disabled,
}) => {
  if (selected) {
    selected = isArray(selected) ? selected : [selected];
  }
  return (
    <TypeAheadSelect
      id={id}
      key={id}
      labelKey={labelKey}
      defaultInputValue={defaultValue}
      placeholder={placeholder}
      options={choices}
      multiple={multiple}
      selected={selected}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
    />
  );
};

TypeAhead.defaultProps = {
  labelKey: undefined,
  defaultValue: undefined,
  placeholder: undefined,
  multiple: false,
  selected: undefined,
  onChange: noop,
  onBlur: noop,
  disabled: false,
};

TypeAhead.propTypes = {
  id: PropTypes.string.isRequired,
  labelKey: PropTypes.string,
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  choices: PropTypes.array.isRequired,
  multiple: PropTypes.bool,
  selected: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
};

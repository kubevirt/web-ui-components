import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Col, ControlLabel, FormGroup, HelpBlock, FieldLevelHelp } from 'patternfly-react';
import { get } from 'lodash';

import { VALIDATION_INFO_TYPE } from '../../constants';
import { prefixedId } from '../../utils';

export const FormControlLabel = ({ isRequired, title, help }) => (
  <React.Fragment>
    <ControlLabel className={isRequired ? 'required-pf' : null}>{title}</ControlLabel>
    {help && <FieldLevelHelp className="kubevirt-form-group__field-help" placement="right" content={help} />}
  </React.Fragment>
);

FormControlLabel.defaultProps = {
  isRequired: false,
  title: '',
  help: '',
};

FormControlLabel.propTypes = {
  isRequired: PropTypes.bool,
  title: PropTypes.string,
  help: PropTypes.string,
};

export const ValidationFormRow = ({
  children,
  id,
  className,
  isHidden,
  validation,
  controlSize,
  labelSize,
  textPosition,
  ...props
}) => {
  if (isHidden) {
    return null;
  }

  return (
    <FormGroup
      id={prefixedId(id, 'id-form-row')}
      validationState={validation && validation.type !== VALIDATION_INFO_TYPE ? validation.type : null}
      className={classNames('kubevirt-form-group', className)}
    >
      <Col sm={labelSize} className={textPosition}>
        <FormControlLabel {...props} />
      </Col>
      <Col sm={controlSize}>{children}</Col>
    </FormGroup>
  );
};

ValidationFormRow.defaultProps = {
  ...FormControlLabel.defaultProps,
  children: null,
  id: null,
  className: null,
  isHidden: false,
  validation: {},
  controlSize: 5,
  labelSize: 3,
  textPosition: 'text-right',
};

ValidationFormRow.propTypes = {
  ...FormControlLabel.propTypes,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  id: PropTypes.string,
  className: PropTypes.string,
  isHidden: PropTypes.bool,
  validation: PropTypes.object,
  controlSize: PropTypes.number,
  labelSize: PropTypes.number,
  textPosition: PropTypes.string,
};

export const FormRow = ({ children, validation, ...props }) => {
  const validationMessage = get(validation, 'message', null);

  return (
    <ValidationFormRow validation={validation} {...props}>
      {children}
      {validationMessage && <HelpBlock>{validationMessage}</HelpBlock>}
    </ValidationFormRow>
  );
};

FormRow.defaultProps = ValidationFormRow.defaultProps;

FormRow.propTypes = ValidationFormRow.propTypes;

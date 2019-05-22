import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Col, ControlLabel, FormGroup, HelpBlock, FieldLevelHelp } from 'patternfly-react';

import { get } from '../../selectors';

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

  const validationType = get(validation, 'type', VALIDATION_INFO_TYPE);

  return (
    <FormGroup
      id={prefixedId(id, 'id-form-row')}
      validationState={validationType !== VALIDATION_INFO_TYPE ? validationType : null}
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

export const HelpFormRow = ({ children, validation, ...props }) => {
  const validationMessage = get(validation, 'message');

  return (
    <ValidationFormRow validation={validation} {...props}>
      {children}
      {validationMessage && <HelpBlock>{validationMessage}</HelpBlock>}
    </ValidationFormRow>
  );
};

HelpFormRow.defaultProps = ValidationFormRow.defaultProps;

HelpFormRow.propTypes = ValidationFormRow.propTypes;

// renders only when props change (shallow compare)
export class FormRow extends React.Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !!Object.keys(this.props).find(key => key !== 'children' && this.props[key] !== nextProps[key]);
  }

  render() {
    return <HelpFormRow {...this.props} />;
  }
}

FormRow.defaultProps = HelpFormRow.defaultProps;

FormRow.propTypes = HelpFormRow.propTypes;

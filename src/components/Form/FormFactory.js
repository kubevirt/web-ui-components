import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormGroup, Col, ControlLabel, HelpBlock, Form, FieldLevelHelp } from 'patternfly-react';
import { get } from 'lodash';

import { Dropdown, Checkbox, Text, TextArea, Integer } from '.';
import { VALIDATION_INFO_TYPE, VALIDATION_ERROR_TYPE } from '../../constants';
import { getValidationObject } from '../../utils/validations';
import { ERROR_IS_REQUIRED } from '../Wizard/CreateVmWizard/strings';
import { settingsValue } from '../../k8s/selectors';
import { TEXT_AREA, DROPDOWN, CHECKBOX, POSITIVE_NUMBER, LABEL, CUSTOM, PASSWORD } from './constants';

export const getFormElement = props => {
  /* eslint-disable react/prop-types */
  const {
    type,
    id,
    value,
    title,
    onChange,
    onFormChange,
    onBlur,
    choices,
    defaultValue,
    isControlled,
    disabled,
    className,
    CustomComponent,
    extraProps,
  } = props;
  /* eslint-enable react/prop-types */
  switch (type) {
    case TEXT_AREA:
      return (
        <TextArea
          id={id}
          key={id}
          value={isControlled ? value || '' : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          className={className}
          disabled={disabled}
        />
      );
    case DROPDOWN:
      return (
        <Dropdown id={id} value={value || defaultValue} onChange={onChange} choices={choices} disabled={disabled} />
      );
    case CHECKBOX:
      return (
        <Checkbox
          id={id}
          key={id}
          title={title}
          checked={isControlled ? value || false : undefined}
          onBlur={onBlur}
          onChange={onChange}
          className={className}
          disabled={disabled}
        />
      );
    case POSITIVE_NUMBER:
      return (
        <Integer
          id={id}
          key={id}
          value={isControlled ? value || '' : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          className={className}
          positive
          disabled={disabled}
        />
      );
    case LABEL:
      return (
        <div className={className} key={id}>
          {value}
        </div>
      );
    case CUSTOM:
      return (
        <CustomComponent
          onChange={onChange}
          onFormChange={onFormChange}
          id={id}
          key={id}
          value={value || defaultValue}
          className={className}
          extraProps={extraProps}
        />
      );
    case PASSWORD:
      return (
        <Text
          id={id}
          key={id}
          value={isControlled ? value || '' : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          disabled={disabled}
          className={className}
          type="password"
        />
      );
    default:
      return (
        <Text
          id={id}
          key={id}
          value={isControlled ? value || '' : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          className={className}
          disabled={disabled}
        />
      );
  }
};

export const validateForm = (formFields, formValues) => {
  let formValid = true;

  const visibleFieldKeys = Object.keys(formFields).filter(
    key => formFields[key] && (formFields[key].isVisible ? formFields[key].isVisible(formValues) : true)
  );

  // check if all required fields are defined
  const requiredKeys = visibleFieldKeys.filter(key => formFields[key].required);
  formValid = requiredKeys.every(key => settingsValue(formValues, key));

  if (formValid) {
    // check if all fields are valid
    formValid = visibleFieldKeys.every(key => get(formValues[key], 'validation.type') !== VALIDATION_ERROR_TYPE);
  }

  return formValid;
};

export const getFieldValidation = (changedField, value, newFormValues) => {
  let validation;
  if (changedField && changedField.required && String(value).trim().length === 0) {
    validation = getValidationObject(ERROR_IS_REQUIRED);
  } else if (changedField && changedField.validate) {
    validation = changedField.validate(newFormValues);
  }

  if (changedField && validation) {
    validation.message = `${changedField.title} ${validation.message}`;
  }

  return validation;
};

const onChange = (formFields, formValues, value, key, onFormChange) => {
  const newFormValues = {
    ...formValues,
    [key]: {
      value,
    },
  };

  const changedField = formFields[key];
  const validation = getFieldValidation(changedField, value, newFormValues);
  newFormValues[key].validation = validation;
  const formValid = validateForm(formFields, newFormValues);

  if (changedField.onChange) {
    // to hook field-specific action
    changedField.onChange({ value, validation }, key, formValid, formValues, onFormChange);
  }

  onFormChange({ value, validation }, key, formValid); // to update state data
};

const getLabel = field =>
  field.type !== 'checkbox' && (
    <React.Fragment>
      <ControlLabel className={field.required ? 'required-pf' : null}>{field.title}</ControlLabel>
      {field.help && (
        <FieldLevelHelp className="kubevirt-form-group__field-help" placement="right" content={field.help} />
      )}
    </React.Fragment>
  );

const getFormGroups = ({
  fields,
  fieldsValues,
  onFormChange,
  textPosition,
  showLabels,
  labelSize,
  controlSize,
  horizontal,
}) =>
  Object.keys(fields)
    .filter(key => fields[key] && (!fields[key].isVisible || fields[key].isVisible(fieldsValues)))
    .map(key => {
      const field = fields[key];
      const values = fieldsValues[key];
      const validation = get(values, 'validation');
      const value = get(values, 'value');
      const validationMessage = get(validation, 'message');
      const hasValidationMessage = !!validationMessage;
      const hasAddendum = !!field.addendum;
      let colProps = {
        sm: controlSize,
      };

      const child = getFormElement({
        ...field,
        value,
        isControlled: true,
        onChange: newValue => onChange(fields, fieldsValues, newValue, key, onFormChange),
        onFormChange,
        className: classNames(field.className, {
          'kubevirt-form-group__field--with-addendum': hasAddendum,
        }),
      });

      let label;

      if (showLabels && field.title) {
        if (horizontal) {
          label = (
            <Col sm={labelSize} className={textPosition}>
              {getLabel(field)}
            </Col>
          );
        } else {
          label = getLabel(field);
        }
      }

      if (!horizontal) {
        colProps = {};
      }

      return (
        <FormGroup
          key={key}
          validationState={validation && validation.type !== VALIDATION_INFO_TYPE ? validation.type : null}
          className={classNames('kubevirt-form-group', {
            'kubevirt-form-group--no-bottom': horizontal && field.noBottom,
            'kubevirt-form-group--help': !horizontal && hasValidationMessage,
            'kubevirt-form-group--no-help': !horizontal && !hasValidationMessage,
          })}
        >
          {horizontal && label}
          <Col {...colProps}>
            {!horizontal && label}
            {child}
            {hasAddendum && <span className="kubevirt-form-group__addendum">{field.addendum}</span>}
            {hasValidationMessage && <HelpBlock>{validationMessage}</HelpBlock>}
          </Col>
        </FormGroup>
      );
    });

export const InlineFormFactory = ({ fields, fieldsValues, onFormChange, showLabels }) =>
  getFormGroups({ fields, fieldsValues, onFormChange, horizontal: true, showLabels });

export const ListFormFactory = ({ fields, fieldsValues, onFormChange, actions, columnSizes, showLabels }) => {
  const formGroups = getFormGroups({ fields, fieldsValues, onFormChange, showLabels });
  const form = formGroups.map((formGroup, index) => (
    <Col
      key={`col-${index}`}
      {...(Array.isArray(columnSizes) ? columnSizes[index] : columnSizes)}
      className={classNames('kubevirt-list-form-factory__column', {
        'kubevirt-list-form-factory__column--last': index === formGroups.length - 1,
      })}
    >
      {formGroup}
    </Col>
  ));

  return (
    <React.Fragment>
      {form}
      <div className="kubevirt-list-form-factory__actions">{actions}</div>
    </React.Fragment>
  );
};

ListFormFactory.defaultProps = {
  showLabels: true,
};

ListFormFactory.propTypes = {
  fields: PropTypes.object.isRequired,
  fieldsValues: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  columnSizes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  showLabels: PropTypes.bool,
};

export const FormFactory = ({
  fields,
  fieldsValues,
  onFormChange,
  textPosition,
  labelSize,
  controlSize,
  formClassName,
  horizontal,
  showLabels,
}) => {
  const formGroups = getFormGroups({
    fields,
    fieldsValues,
    onFormChange,
    textPosition,
    labelSize,
    controlSize,
    horizontal,
    showLabels,
  });
  return (
    <Form horizontal={horizontal} className={formClassName}>
      {formGroups}
    </Form>
  );
};

FormFactory.defaultProps = {
  textPosition: 'text-right',
  labelSize: 3,
  controlSize: 5,
  formClassName: undefined,
  horizontal: true,
  showLabels: true,
};

FormFactory.propTypes = {
  fields: PropTypes.object.isRequired,
  fieldsValues: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  textPosition: PropTypes.string,
  labelSize: PropTypes.number,
  controlSize: PropTypes.number,
  formClassName: PropTypes.string,
  horizontal: PropTypes.bool,
  showLabels: PropTypes.bool,
};

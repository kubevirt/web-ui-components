import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Col, ControlLabel, HelpBlock, Form, FieldLevelHelp } from 'patternfly-react';
import { get } from 'lodash';

import { Dropdown, Checkbox, Text, TextArea, Integer } from '.';

export const getFormElement = props => {
  const { type, id, value, title, onChange, onBlur, choices, defaultValue, isControlled } = props;
  switch (type) {
    case 'textarea':
      return (
        <TextArea
          id={id}
          key={id}
          value={isControlled ? value || '' : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onBlur={onBlur}
          onChange={onChange}
        />
      );
    case 'dropdown':
      return <Dropdown id={id} value={value || defaultValue} onChange={onChange} onBlur={onBlur} choices={choices} />;
    case 'checkbox':
      return (
        <Checkbox
          id={id}
          key={id}
          title={title}
          checked={isControlled ? value || false : undefined}
          onBlur={onBlur}
          onChange={onChange}
        />
      );
    case 'positive-number':
      return (
        <Integer
          id={id}
          key={id}
          value={isControlled ? value || '' : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          positive
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
        />
      );
  }
};

export const FormFactory = ({
  fields,
  fieldsValues,
  onFormChange,
  textPosition,
  labelSize,
  controlSize,
  formClassName,
}) => {
  const formGroups = Object.keys(fields)
    .filter(key => fields[key] && (!fields[key].isVisible || fields[key].isVisible(fieldsValues)))
    .map(key => {
      const field = fields[key];
      const values = fieldsValues[key];
      const validMsg = get(values, 'validMsg', null);
      const value = get(values, 'value');

      const child = getFormElement({
        ...field,
        value,
        isControlled: true,
        onChange: newValue => onFormChange(newValue, key),
      });

      return (
        <FormGroup
          key={key}
          validationState={validMsg ? 'error' : null}
          className={field.noBottom ? 'form-group-no-bottom' : undefined}
        >
          <Col sm={labelSize} className={textPosition}>
            {field.type === 'checkbox' ? null : (
              <React.Fragment>
                <ControlLabel className={field.required ? 'required-pf' : null}>{field.title}</ControlLabel>
                {field.help ? <FieldLevelHelp placement="right" content={field.help} /> : undefined}
              </React.Fragment>
            )}
          </Col>
          <Col sm={controlSize}>
            {child}
            <HelpBlock>{validMsg}</HelpBlock>
          </Col>
        </FormGroup>
      );
    });
  return (
    <Form horizontal className={formClassName}>
      {formGroups}
    </Form>
  );
};

FormFactory.defaultProps = {
  textPosition: 'text-right',
  labelSize: 3,
  controlSize: 5,
  formClassName: undefined,
};

FormFactory.propTypes = {
  fields: PropTypes.object.isRequired,
  fieldsValues: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  textPosition: PropTypes.string,
  labelSize: PropTypes.number,
  controlSize: PropTypes.number,
  formClassName: PropTypes.string,
};

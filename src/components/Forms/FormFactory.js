import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Col, ControlLabel, HelpBlock, Form, FieldLevelHelp } from 'patternfly-react';
import { get, has } from 'lodash';
import { TextArea, Dropdown, Checkbox, Text } from '.';

export const FormFactory = ({ fields, fieldsValues, onFormChange }) => {
  const formGroups = Object.keys(fields)
    .filter(key => !fields[key].isVisible || fields[key].isVisible(fieldsValues))
    .map(key => {
      let child;
      const validMsg = get(fieldsValues[key], 'validMsg');
      switch (fields[key].type) {
        case 'textarea':
          child = <TextArea fieldKey={key} value={get(fieldsValues[key], 'value', '')} onChange={onFormChange} />;
          break;
        case 'dropdown':
          child = (
            <Dropdown
              fieldKey={key}
              value={has(fieldsValues[key], 'value') ? fieldsValues[key].value : fields[key].default}
              choices={typeof fields[key].values === 'function' ? fields[key].values() : fields[key].values}
              onChange={onFormChange}
            />
          );
          break;
        case 'checkbox':
          child = (
            <Checkbox
              fieldKey={key}
              checked={get(fieldsValues[key], 'value', false)}
              title={fields[key].title}
              onChange={onFormChange}
            />
          );
          break;
        case 'text':
        default:
          child = <Text fieldKey={key} value={get(fieldsValues[key], 'value', '')} onChange={onFormChange} />;
      }
      return (
        <FormGroup
          key={key}
          validationState={validMsg ? 'error' : null}
          className={fields[key].noBottom ? 'form-group-no-bottom' : undefined}
        >
          <Col sm={3} className="text-right">
            {fields[key].type === 'checkbox' ? null : (
              <React.Fragment>
                <ControlLabel className={fields[key].required ? 'required-pf' : null}>{fields[key].title}</ControlLabel>
                {fields[key].help ? <FieldLevelHelp placement="right" content={fields[key].help()} /> : undefined}
              </React.Fragment>
            )}
          </Col>
          <Col sm={5}>
            {child}
            <HelpBlock>{validMsg}</HelpBlock>
          </Col>
        </FormGroup>
      );
    });
  return <Form horizontal>{formGroups}</Form>;
};

FormFactory.propTypes = {
  fields: PropTypes.object.isRequired,
  fieldsValues: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired
};

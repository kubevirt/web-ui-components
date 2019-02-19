import { FormFactory, getFormElement } from '../FormFactory';
import { TEXT_AREA, DROPDOWN, CHECKBOX, POSITIVE_NUMBER, LABEL, PASSWORD } from '../constants';

export const getPositiveNumber = () =>
  getFormElement({
    type: POSITIVE_NUMBER,
    id: 'test-id',
    value: 48,
    onChange: jest.fn(),
  });

export default {
  component: FormFactory,
  props: {
    fields: {
      textField: {
        // type is default
        id: 'text',
        title: 'textField',
      },
      passwordField: {
        id: 'password',
        title: 'passwordField',
        type: PASSWORD,
      },
      requiredField: {
        id: 'required',
        title: 'requiredField',
        required: true,
      },
      invisibleField: {
        id: 'invisible',
        title: 'invisibleField',
        isVisible: () => false,
      },
      dropdownField: {
        id: 'dropdown',
        title: 'dropdownField',
        type: DROPDOWN,
        defaultValue: 'default',
        choices: [
          {
            name: 'value1',
          },
          {
            name: 'value2',
          },
        ],
      },
      textAreaField: {
        id: 'textarea',
        type: TEXT_AREA,
      },
      checkboxField: {
        id: 'checkbox',
        type: CHECKBOX,
        title: 'checkboxFieldTitle',
      },
      labelField: {
        id: 'label',
        type: LABEL,
        title: 'labelTitle',
      },
    },
    fieldsValues: {
      textField: {
        value: 'textField',
      },
      passwordField: {
        value: 'passswordField',
      },
      requiredField: {
        value: 'requiredField',
      },
      invisibleField: {
        value: 'invisibleField',
      },
      dropdownField: {
        value: 'dropdownField',
      },
      textAreaField: {
        value: 'textarea',
      },
      checkboxField: {
        value: true,
      },
      labelField: {
        type: 'labelValue',
      },
    },
    onFormChange: () => {},
  },
};

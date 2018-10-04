import { FormFactory } from '..';
import { getFormElement } from '../FormFactory';

export const getPositiveNumber = () =>
  getFormElement({
    type: 'positive-number',
    id: 'test-id',
    value: 48,
    onChange: jest.fn()
  });

export default {
  component: FormFactory,
  props: {
    fields: {
      textField: {
        title: 'textField'
      },
      requiredField: {
        title: 'requiredField',
        required: true
      },
      invisibleField: {
        title: 'invisibleField',
        isVisible: () => false
      },
      dropdownField: {
        id: 'dropdown',
        title: 'dropdownField',
        type: 'dropdown',
        defaultValue: 'default',
        choices: [
          {
            name: 'value1'
          },
          {
            name: 'value2'
          }
        ]
      },
      textAreaField: {
        type: 'textarea'
      },
      checkboxField: {
        type: 'checkbox',
        title: 'checkboxFieldTitle'
      }
    },
    fieldsValues: {
      textField: {
        value: 'textField'
      },
      requiredField: {
        value: 'requiredField'
      },
      invisibleField: {
        value: 'invisibleField'
      },
      dropdownField: {
        value: 'dropdownField'
      },
      textAreaField: {
        value: 'textarea'
      },
      checkboxField: {
        value: true
      }
    },
    onFormChange: () => {}
  }
};

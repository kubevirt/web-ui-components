import { FormFactory, getFormElement } from '../FormFactory';

export const getPositiveNumber = () =>
  getFormElement({
    type: 'positive-number',
    id: 'test-id',
    value: 48,
    onChange: jest.fn(),
  });

export default {
  component: FormFactory,
  props: {
    fields: {
      textField: {
        id: 'text',
        title: 'textField',
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
        type: 'dropdown',
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
        type: 'textarea',
      },
      checkboxField: {
        id: 'checkbox',
        type: 'checkbox',
        title: 'checkboxFieldTitle',
      },
      labelField: {
        id: 'label',
        type: 'label',
        title: 'labelTitle',
      },
    },
    fieldsValues: {
      textField: {
        value: 'textField',
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

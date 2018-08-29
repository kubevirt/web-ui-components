import { FormFactory } from '..';

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
        title: 'dropdownField',
        type: 'dropdown',
        default: 'default',
        values: ['value1', 'value2']
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
        tivaluetle: 'requiredField'
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

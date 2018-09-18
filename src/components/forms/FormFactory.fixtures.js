export const minFormFields = {
  textField: {
    title: 'textField'
  },
  invisibleField: {
    title: 'invisibleField',
    isVisible: () => false
  }
};

export const allFormFields = {
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
    values: [
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
};

export const formFieldsValues = {
  textField: {
    value: 'textFieldValue',
    validMsg: 'validation message'
  },
  requiredField: {
    value: 'requiredFieldValue'
  },
  invisibleField: {
    value: 'invisibleFieldValue'
  },
  dropdownField: {
    value: 'dropdownFieldValue'
  },
  textAreaField: {
    value: 'textareaValue'
  },
  checkboxField: {
    value: true
  }
};

import { FormRow, ValidationFormRow } from '../FormRow';
import { VALIDATION_ERROR_TYPE } from '../../../constants';

export default [
  {
    component: FormRow,
    name: 'FormRow',
    props: {
      id: '1',
      children: 'text',
      onChange: () => {},
    },
  },
  {
    component: ValidationFormRow,
    name: 'error ValidationFormRow',
    props: {
      id: '1',
      children: 'test',
      validation: {
        message: 'error validation',
        type: VALIDATION_ERROR_TYPE,
      },
      onChange: () => {},
    },
  },
];

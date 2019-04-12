import { GenericError, GenericProgress, GenericSuccess, GenericStatus, ValidationError } from '../StatusComponents';

export default [
  {
    component: GenericProgress,
    name: 'Show Generic Progress',
    props: {
      status: 'provisioning',
      text: 'Provisioning',
    },
  },
  {
    component: GenericError,
    name: 'Show Generic Error',
    props: {
      status: 'registration error',
      text: 'Registration Error',
    },
  },
  {
    component: GenericSuccess,
    name: 'Show Generic Success',
    props: {
      status: 'provisioned',
      text: 'Provisioned',
    },
  },
  {
    component: GenericError,
    name: 'Show Generic Error with details',
    props: {
      status: 'registration error',
      text: 'Registration Error',
      errorMessage: 'some error details',
    },
  },
  {
    component: ValidationError,
    name: 'Show Validation Error',
    props: {
      status: 'validation error',
      text: 'Validation Error(s)',
      errorMessage: 'some validation errors',
    },
  },
  {
    component: GenericStatus,
    name: 'Show GenericStatus',
    props: {
      status: 'provisioned',
      text: 'Provisioned',
    },
  },
];

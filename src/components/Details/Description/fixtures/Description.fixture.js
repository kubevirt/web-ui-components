import { Description } from '..';

import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';

export default [
  {
    component: Description,
    name: 'Description',
    props: {
      vm: cloudInitTestVm,
      onFormChange: () => {},
      formValues: {
        description: {
          value: 'vm description',
        },
      },
    },
  },
  {
    component: Description,
    name: 'Description edit',
    props: {
      vm: cloudInitTestVm,
      editing: true,
      onFormChange: () => {},
      formValues: {
        description: {
          value: 'vm description',
        },
      },
    },
  },
  {
    component: Description,
    name: 'Description updating',
    props: {
      vm: cloudInitTestVm,
      updating: true,
      onFormChange: () => {},
      formValues: {
        description: {
          value: 'vm description',
        },
      },
    },
  },
];

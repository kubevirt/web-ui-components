import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';

import { Description } from '..';

export default [
  {
    component: Description,
    name: 'Description',
    props: {
      obj: cloudInitTestVm,
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
      obj: cloudInitTestVm,
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
      obj: cloudInitTestVm,
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

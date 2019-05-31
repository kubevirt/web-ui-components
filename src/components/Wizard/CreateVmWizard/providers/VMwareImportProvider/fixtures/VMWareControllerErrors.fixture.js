import VMWareControllerErrors from '../VMWareControllerErrors';
import { vmWareDeploymentFailed } from '../../../../../../tests/mocks/v2v';

export default [
  {
    component: VMWareControllerErrors,
    props: {
      id: 1,
      errors: [
        {
          content: 'error content',
          title: 'failed',
          isExpanded: true,
          isError: false,
        },
        {
          content: vmWareDeploymentFailed,
          title: 'failed',
          isExpanded: true,
          isError: true,
        },
        {
          content: 'error content',
          title: 'failed',
          isExpanded: false,
          isError: false,
        },
      ],
    },
  },
];

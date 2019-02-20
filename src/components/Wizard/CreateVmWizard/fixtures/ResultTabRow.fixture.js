import { ResultTabRow } from '../ResultTabRow';
import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';

export default [
  {
    component: ResultTabRow,
    name: 'Error',
    props: {
      title: 'Error',
      content: 'Failed',
      expanded: true,
    },
  },
  {
    component: ResultTabRow,
    name: 'Success',
    props: {
      title: 'VirtualMachine myvm Detail',
      content: cloudInitTestVm,
    },
  },
];

import { ResultTab } from '../ResultTab';

export default [
  {
    component: ResultTab,
    name: 'Loading',
    props: {
      isSuccessful: null,
    },
  },
  {
    component: ResultTab,
    name: 'Error',
    props: {
      isSuccessful: false,
      children: ['Error'],
    },
  },
  {
    component: ResultTab,
    name: 'Success',
    props: {
      isSuccessful: true,
      children: ['Result'],
    },
  },
];

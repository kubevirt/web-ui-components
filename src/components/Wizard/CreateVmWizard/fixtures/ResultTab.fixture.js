import { ResultTab } from '../ResultTab';

export default [
  {
    component: ResultTab,
    name: 'Loading',
    props: {
      success: null,
      results: null,
    },
  },
  {
    component: ResultTab,
    name: 'Error',
    props: {
      success: false,
      results: ['Failed'],
    },
  },
  {
    component: ResultTab,
    name: 'Success',
    props: {
      success: true,
      results: ['Finished succesfully'],
    },
  },
];

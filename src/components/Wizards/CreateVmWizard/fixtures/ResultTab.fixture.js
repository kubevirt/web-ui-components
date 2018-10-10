import ResultTab from '../ResultTab';

export default [
  {
    component: ResultTab,
    name: 'Loading',
    props: {
      success: null,
      result: null
    }
  },
  {
    component: ResultTab,
    name: 'Error',
    props: {
      success: false,
      result: 'Failed'
    }
  },
  {
    component: ResultTab,
    name: 'Success',
    props: {
      success: true,
      result: 'Finished succesfully'
    }
  }
];

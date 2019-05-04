import { HealthItem, OK_STATE, ERROR_STATE, WARNING_STATE, LOADING_STATE } from '../HealthItem';

export default [
  {
    component: HealthItem,
    name: 'Healthy state',
    props: {
      message: 'Healthy state',
      state: OK_STATE,
    },
  },
  {
    component: HealthItem,
    name: 'Error state',
    props: {
      message: 'Error state',
      state: ERROR_STATE,
    },
  },
  {
    component: HealthItem,
    name: 'Warning state',
    props: {
      message: 'Warning state',
      state: WARNING_STATE,
    },
  },
  {
    component: HealthItem,
    name: 'State with detail',
    props: {
      message: 'State with detail',
      state: OK_STATE,
      details: 'Details message',
    },
  },
  {
    component: HealthItem,
    name: 'Loading health',
    props: {
      state: LOADING_STATE,
    },
  },
];

import { Health } from '../Health';

export const healthData = {
  data: {
    healthy: false,
    message: 'Error message',
  },
  loaded: true,
};

export default [
  {
    component: Health,
    props: { ...healthData },
  },
];

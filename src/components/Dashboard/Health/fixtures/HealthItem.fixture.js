import { HealthItem } from '../HealthItem';

export default [
  {
    component: HealthItem,
    props: {
      data: {
        healthy: {
          message: 'OCS is Healthy',
          iconname: 'check-circle',
          classname: 'ok',
        },
      },
    },
  },
];

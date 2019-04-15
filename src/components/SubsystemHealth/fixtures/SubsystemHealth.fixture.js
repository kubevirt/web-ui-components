import { SubsystemHealth } from '../SubsystemHealth';

export const healthData = {
  data: {
    ocp: {
      healthy: 0,
      message: 'Error message',
    },
    cnv: {
      healthy: 1,
      message: 'Error message',
    },
    ceph: {
      healthy: 2,
      message: 'Error message',
    },
  },
  loaded: true,
};

export default [
  {
    component: SubsystemHealth,
    props: { ...healthData },
  },
];

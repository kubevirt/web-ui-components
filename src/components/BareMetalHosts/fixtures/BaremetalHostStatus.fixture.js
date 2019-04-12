import { BaremetalHostStatus } from '../BaremetalHostStatus';

export default [
  {
    component: BaremetalHostStatus,
    name: 'Show Generic Status',
    props: {
      host: {
        status: {
          provisioning: {
            state: 'unknown state',
          },
        },
      },
    },
  },
  {
    component: BaremetalHostStatus,
    name: 'Show Generic Success',
    props: {
      host: {
        status: {
          provisioning: {
            state: 'provisioned',
          },
        },
      },
    },
  },
];

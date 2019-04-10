import { BaremetalHostRole } from '../BaremetalHostRole';

export default [
  {
    component: BaremetalHostRole,
    name: 'Baremetal host role cell',
    props: {
      machine: {
        metadata: {
          labels: {
            'machine.openshift.io/cluster-api-machine-role': 'worker',
          },
        },
      },
    },
  },
];

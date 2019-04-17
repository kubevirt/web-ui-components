import { BaremetalHostRole } from '../BaremetalHostRole';

export default [
  {
    component: BaremetalHostRole,
    name: 'Baremetal host role cell',
    props: {
      machine: {
        metadata: {
          labels: {
            'sigs.k8s.io/cluster-api-machine-role': 'worker',
          },
        },
      },
    },
  },
];

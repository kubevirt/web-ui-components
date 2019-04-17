export default [
  {
    machine: {
      metadata: {
        labels: {
          'sigs.k8s.io/cluster-api-machine-role': 'worker',
        },
      },
    },
  },
];

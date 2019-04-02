import { StorageDetails } from '../StorageDetails';

export const storageClusterDetailsData = {
  storageCluster: [
    {
      metadata: {
        name: 'rook-ceph',
      },
    },
  ],
};

export default [
  {
    component: StorageDetails,
    props: { ...storageClusterDetailsData },
  },
  {
    component: StorageDetails,
    name: 'Loading cluster details',
  },
];

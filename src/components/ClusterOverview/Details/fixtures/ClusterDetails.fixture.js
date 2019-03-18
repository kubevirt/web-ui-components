import { ClusterDetails } from '../ClusterDetails';

export const clusterDetailsData = {
  openshiftVersionResponse: {
    data: {
      result: [
        {
          metric: {
            gitVersion: 'v4.0.0',
          },
        },
      ],
    },
  },
  infrastructure: {
    status: {
      platform: 'AWS',
      apiServerURL: 'https://api.clusterName.clusterDoman',
    },
  },
};

export default [
  {
    component: ClusterDetails,
    props: { ...clusterDetailsData },
  },
  {
    component: ClusterDetails,
    name: 'Loading cluster details',
  },
];

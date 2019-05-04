import { Details } from '../Details';

export const clusterDetailsData = {
  openshiftClusterVersionResponse: {
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
    component: Details,
    props: clusterDetailsData,
  },
  {
    component: Details,
    name: 'Loading cluster details',
    props: {},
  },
];

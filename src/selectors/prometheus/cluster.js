import { get } from 'lodash';

export const getOpenshiftVersion = openshiftClusterVersions => {
  // if cluster has more nodes, we take the version for the fist one
  const firstCluster = openshiftClusterVersions && openshiftClusterVersions[0];
  if (firstCluster) {
    return get(firstCluster, 'metric.gitVersion');
  }
  return null;
};

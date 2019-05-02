import { get } from 'lodash';

export const getOpenshiftVersion = openshiftClusterVersionResponse => {
  const result = get(openshiftClusterVersionResponse, 'data.result', []);

  // if cluster has more nodes, we take the version for the fist one
  const firstCluster = Array.isArray(result) ? result[0] : result;
  if (firstCluster) {
    return get(firstCluster, 'metric.gitVersion', '').replace(/-?dirty/, ''); // FIXME: demo only
  }
  return null;
};

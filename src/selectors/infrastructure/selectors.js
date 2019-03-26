import { get } from 'lodash';

export const getClusterName = infrastructure => {
  const apiServerURL = get(infrastructure, 'status.apiServerURL');
  let clusterName;
  if (apiServerURL) {
    clusterName = apiServerURL.replace('https://api.', '');
    const portIndex = clusterName.indexOf(':');
    if (portIndex !== -1) {
      clusterName = clusterName.slice(0, portIndex);
    }
  }
  return clusterName;
};

export const getInfrastructurePlatform = infrastructure => get(infrastructure, 'status.platform');

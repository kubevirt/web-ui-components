import { get } from 'lodash';

export const getDeploymentContainer = (deployment, containerName) =>
  get(deployment, 'spec.template.spec.containers', []).find(container => container.name === containerName);

import { get } from 'lodash';

export const getSubPagePath = (apiObj, model, subPage) => {
  if (!apiObj) {
    return undefined;
  }
  const ns = get(apiObj, 'metadata.namespace', 'default');
  const name = get(apiObj, 'metadata.name');
  return `/k8s/ns/${ns}/${model.path}/${name}/${subPage}`;
};

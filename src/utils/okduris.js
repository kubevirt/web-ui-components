import { get } from '../selectors/internal';

export const getSubPagePath = (apiObj, model, subPage) => {
  if (!apiObj || !model) {
    return undefined;
  }
  const ns = get(apiObj, 'metadata.namespace', 'default');
  const name = get(apiObj, 'metadata.name');
  subPage = subPage ? `/${subPage}` : '';
  return `/k8s/ns/${ns}/${model.path}/${name}${subPage}`;
};

import { get } from 'lodash';

import { findKeySuffixValue, getValueByPrefix } from './internal';

export const getName = value => get(value, 'metadata.name');
export const getNamespace = value => get(value, 'metadata.namespace');
export const getUid = resource => get(resource, 'metadata.uid');
export const getId = value => `${getNamespace(value)}-${getName(value)}`;

export const getStorageSize = resources => get(resources, 'requests.storage');

export const getStatusPhase = entity => get(entity, 'status.phase');
export const getStatusConditions = entity => get(entity, 'status.conditions', []);
export const getStatusConditionOfType = (entity, type) =>
  getStatusConditions(entity).find(condition => condition.type === type);

export const getFalseStatusConditions = entity =>
  getStatusConditions(entity).filter(condition => condition.status !== 'True');

export const findFalseStatusConditionMessage = entity => {
  const notReadyConditions = getFalseStatusConditions(entity);
  if (notReadyConditions.length > 0) {
    return notReadyConditions[0].message || `Step: ${notReadyConditions[0].type}`;
  }
  return undefined;
};

export const getLabelKeyValue = (entity, label) => {
  const labels = get(entity, 'metadata.labels', {});
  return findKeySuffixValue(labels, label);
};

export const getLabelValue = (entity, label) => get(entity, ['metadata', 'labels', label]);

export const getAnnotationValue = (entity, annotation) => {
  const annotations = get(entity, 'metadata.annotations', {});
  return getValueByPrefix(annotations, annotation);
};

import { get } from 'lodash';

import { findKeySuffixValue, getValueByPrefix } from './internal';

export const getKind = value => get(value, 'kind');
export const getApiGroup = value => get(value, 'apiGroup');
export const getApiVersion = value => get(value, 'apiVersion');

export const getName = value => get(value, 'metadata.name');
export const getGeneratedName = value => get(value, 'metadata.generateName');
export const getOwnerReferences = value => get(value, 'metadata.ownerReferences');
export const getNamespace = value => get(value, 'metadata.namespace');
export const getUid = resource => get(resource, 'metadata.uid');
export const getLabels = (entity, defaultValue) => get(entity, 'metadata.labels', defaultValue);
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

export const getConditionReason = condition => get(condition, 'reason');
export const isConditionStatusTrue = condition => get(condition, 'status') === 'True';
export const isConditionReason = (condition, reason) => getConditionReason(condition) === reason;

export const getLabelKeyValue = (entity, label) => {
  const labels = get(entity, 'metadata.labels', {});
  return findKeySuffixValue(labels, label);
};

export const getLabelValue = (entity, label) => get(entity, ['metadata', 'labels', label]);

export const getAnnotationValue = (entity, annotation) => {
  const annotations = get(entity, 'metadata.annotations', {});
  return getValueByPrefix(annotations, annotation);
};

export const getCreationTimestamp = resource => get(resource, 'metadata.creationTimestamp');
export const getDeletionTimestamp = resource => get(resource, 'metadata.deletionTimestamp');

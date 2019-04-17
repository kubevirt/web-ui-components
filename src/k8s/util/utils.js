import { get, isEmpty } from 'lodash';

import { getApiVersion, getKind, getName, getNamespace, getOwnerReferences, getUid } from '../../selectors';
import { getModelIndexId } from '../../models';

const getReferenceName = value => get(value, 'name');

export const buildOwnerReference = (owner, blockOwnerDeletion = true) => ({
  apiVersion: getApiVersion(owner),
  kind: getKind(owner),
  name: getName(owner),
  uid: getUid(owner),
  blockOwnerDeletion,
});

export const compareOwnerReference = (obj, otherObj) =>
  getApiVersion(obj) === getApiVersion(otherObj) &&
  getKind(obj) === getKind(otherObj) &&
  getReferenceName(obj) === getReferenceName(otherObj);

export const buildAddOwnerReferencesPatch = (object, additionalOwnerReferences) => {
  const hasOwnerReferences = !isEmpty(getOwnerReferences(object));
  return {
    op: hasOwnerReferences ? 'update' : 'add',
    path: `/metadata/ownerReferences`,
    value: hasOwnerReferences
      ? [...getOwnerReferences(object), ...additionalOwnerReferences]
      : additionalOwnerReferences,
  };
};

export const replaceUpdatedObject = (allResults, object) =>
  allResults.map(result => {
    if (
      getModelIndexId(result) === getModelIndexId(object) &&
      getReferenceName(result) === getReferenceName(object) &&
      getNamespace(result) === getNamespace(object)
    ) {
      return object;
    }
    return result;
  });

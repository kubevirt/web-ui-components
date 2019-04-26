import { get, isEmpty } from 'lodash';

import { getApiVersion, getKind, getName, getOwnerReferences, getUid } from '../../selectors';

export const getReferenceName = value => get(value, 'name');

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

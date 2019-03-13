import { get } from 'lodash';

export const getName = value => get(value, 'metadata.name');
export const getNamespace = value => get(value, 'metadata.namespace');
export const getUid = resource => get(resource, 'metadata.uid');
export const getId = value => `${getNamespace(value)}-${getName(value)}`;

export const getStorageSize = resources => get(resources, 'requests.storage');

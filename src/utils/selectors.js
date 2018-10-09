import { get } from 'lodash';

export const getName = value => get(value, 'metadata.name');
export const getNameSpace = value => get(value, 'metadata.namespace');

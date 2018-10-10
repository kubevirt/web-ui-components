import { get } from 'lodash';

export const getName = value => get(value, 'metadata.name');

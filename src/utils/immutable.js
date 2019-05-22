import { List } from 'immutable';

export const concatImmutableLists = (...args) =>
  args.filter(list => list).reduce((acc, nextArray) => acc.concat(nextArray), List());

export const immutableListToShallowJS = (list, defaultValue = []) =>
  list ? list.toArray().map(p => p.toJSON()) : defaultValue;

export const hasTruthyValue = obj => !!(obj && !!obj.find(value => value));

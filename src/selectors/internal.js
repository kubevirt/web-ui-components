import { get as lodashGet } from 'lodash';
import { fromJS, Iterable } from 'immutable';

export const get = (object, path, defaultValue) => {
  if (typeof path === 'string') {
    path = path.split('.');
  }

  if (Iterable.isIterable(object)) {
    return object.getIn(path, Iterable.isIterable(defaultValue) ? defaultValue : fromJS(defaultValue));
  }
  return lodashGet(object, path, defaultValue);
};

export const len = object => {
  if (!object) {
    return undefined;
  }

  return Iterable.isIterable(object) ? object.size : object.length;
};

export const getValueByPrefix = (obj, keyPrefix) => {
  let objectKey;
  if (obj) {
    objectKey = Object.keys(obj).find(key => key.startsWith(keyPrefix));
  }
  return objectKey ? obj[objectKey] : null;
};

export const findKeySuffixValue = (objects, keyPrefix) => {
  if (objects) {
    const objectKey = Object.keys(objects).find(key => key.startsWith(keyPrefix));
    if (objectKey && objectKey.includes('/')) {
      const objectParts = objectKey.split('/');
      return objectParts[objectParts.length - 1];
    }
  }
  return null;
};

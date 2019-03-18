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

export function prefixedId(idPrefix, id) {
  return idPrefix && id ? `${idPrefix}-${id}` : null;
}

export const getSequence = (from, to) => Array.from({ length: to - from + 1 }, (v, i) => i + from);

export const setNativeValue = (element, value) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
};

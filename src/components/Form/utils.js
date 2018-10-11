export const valueHandler = callback => (typeof callback === 'function' ? value => callback(value) : null);

export const eventValueHandler = (callback, defaultValue = '') =>
  typeof callback === 'function' ? event => callback(event.target.value || defaultValue) : null;

export const checkboxHandler = (callback, defaultValue = false) =>
  typeof callback === 'function' ? event => callback(event.target.checked || defaultValue) : null;

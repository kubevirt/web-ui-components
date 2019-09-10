import { alphanumericRegex } from '../../../utils';

/**
 * Based on V2V Provider Pod manifest.yaml
 */

const MAX_LEN = 30;

// TODO: this needs to be improved to conform validations.js::validateDNS1123SubdomainValue()
const alignWithDNS1123 = str => {
  if (!str) {
    return '';
  }

  // starts with alphaNum
  if (!str.charAt(0).match(alphanumericRegex)) {
    return alignWithDNS1123(str.slice(1));
  }

  // ends with alphaNum
  if (!str.charAt(str.length - 1).match(alphanumericRegex)) {
    return alignWithDNS1123(str.slice(0, -1));
  }

  return str;
};

export const getDefaultSecretName = ({ username, url }) => {
  if (!url) {
    throw new Error('VMware URL can not be empty.');
  }

  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    url = `https://${url}`;
  }
  const u = new URL(url);
  username = username || 'nousername';

  let user = username.split('@')[0].substring(0, 15);
  let host = (u.host || 'nohost').substring(0, MAX_LEN - user.length - 1);

  user = alignWithDNS1123(user);
  host = alignWithDNS1123(host);

  user = user || 'nouser';

  return `${user}-${host}`;
};

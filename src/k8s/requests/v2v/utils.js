/**
 * Based on V2V Provider Pod manifest.yaml
 */

const MAX_LEN = 30;

export const getDefaultSecretName = ({ username, url }) => {
  if (!url) {
    throw new Error('VMware URL can not be empty.');
  }

  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    url = `https://${url}`;
  }
  const u = new URL(url);
  username = username || 'nousername';

  const user = username.split('@')[0].substring(0, 15);
  const host = (u.host || 'nohost').substring(0, MAX_LEN - user.length - 1);

  return `${user}-${host}`;
};

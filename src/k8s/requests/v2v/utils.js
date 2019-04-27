/**
 * Based on V2V Provider Pod manifest.yaml
 */

export const getDefaultSecretName = ({ username, url }) => {
  if (!url) {
    throw new Error('VMWare URL can not be empty.');
  }

  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    url = `https://${url}`;
  }
  const u = new URL(url);
  const host = u.host || 'nohost';

  username = username || 'nousername';
  const user = username.replace('@', '-at-');
  return `${host}-${user}`;
};

import { SecretModel } from '../models';
import { VCENTER_TYPE_LABEL } from '../constants';

export const getDefaultSecretName = ({ username, url }) => {
  const u = new URL(url || '');
  const host = u.host || 'nohost';
  return `${host}-${username}`
};

export const getImportProviderSecretObject = ({ url, username, pwd, secretName, namespace }) => {
  const _secretName = secretName || getDefaultSecretName({ username, url });
  const secret = {
    kind: SecretModel.kind,
    apiVersion: SecretModel.apiVersion,
    metadata: {
      name: _secretName,
      namespace,
      labels: {
        [VCENTER_TYPE_LABEL]: 'true',
      },
    },
    type: 'Opaque',
    data: {
      username: btoa(username),
      password: btoa(pwd),
      url: btoa(url),
    }
  };

  return secret;
};
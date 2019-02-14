/**
 * Based on V2V Provider Pod manifest.yaml
 */

import { SecretModel, V2VVMwareModel } from '../../../../models';
import { VCENTER_TYPE_LABEL } from '../../../../constants';

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
      generateName: _secretName,
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

export const getV2VVMwareObject = ({ name, namespace, connectionSecretName }) => {
  return {
    apiVersion: `${V2VVMwareModel.apiGroup}/${V2VVMwareModel.apiVersion}`,
    kind: V2VVMwareModel.kind,
    metadata: {
      generateName: name,
      namespace,
    },
    spec: {
      connection: connectionSecretName,
    }
  };
};

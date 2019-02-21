/**
 * Based on V2V Provider Pod manifest.yaml
 */

import { SecretModel, V2VVMwareModel } from '../../../../models';
import { VCENTER_TYPE_LABEL, VCENTER_TEMPORARY_LABEL } from '../../../../constants';

export const getDefaultSecretName = ({ username, url }) => {
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    url = `https://${url}`;
  }
  const u = new URL(url || '');
  const host = u.host || 'nohost';

  username = username || 'nousername';
  const user = username.replace('@', '-at-');
  return `${host}-${user}`;
};

export const getImportProviderSecretObject = ({
  url,
  username,
  password,
  secretName,
  namespace,
  isTemporary = false,
}) => {
  const _secretName = secretName || `${getDefaultSecretName({ username, url })}-`;
  const labels = {
    [VCENTER_TYPE_LABEL]: 'true',
  };
  if (isTemporary) {
    // if set, the Secret is not listed for selection within the dropdown box and is automatically garbage-collected (by controller)
    labels[VCENTER_TEMPORARY_LABEL] = 'true'; // will be automatically garbage-collected by the controller
  }

  const secret = {
    kind: SecretModel.kind,
    apiVersion: SecretModel.apiVersion,
    metadata: {
      generateName: _secretName,
      namespace,
      labels,
    },
    type: 'Opaque',
    data: {
      username: btoa(username),
      password: btoa(password),
      url: btoa(url),
    },
  };

  return secret;
};

export const getV2VVMwareObject = ({ name, namespace, connectionSecretName, isTemporary = false }) => {
  const labels = {};
  if (isTemporary) {
    // if set, the Secret is not listed for selection within the dropdown box and is automatically garbage-collected (by controller)
    labels[VCENTER_TEMPORARY_LABEL] = 'true'; // will be automatically garbage-collected by the controller
  }

  return {
    apiVersion: `${V2VVMwareModel.apiGroup}/${V2VVMwareModel.apiVersion}`,
    kind: V2VVMwareModel.kind,
    metadata: {
      generateName: name,
      namespace,
      labels,
    },
    spec: {
      connection: connectionSecretName,
    },
  };
};

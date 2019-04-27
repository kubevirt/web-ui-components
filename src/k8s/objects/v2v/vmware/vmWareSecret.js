import { SecretModel } from '../../../../models';
import { VCENTER_TEMPORARY_LABEL, VCENTER_TYPE_LABEL } from '../../../../constants';
import { getDefaultSecretName } from '../../../requests/v2v/utils';

export const buildVMwareSecret = ({ url, username, password, secretName, namespace, isTemporary = false }) => {
  const _secretName = secretName || `${getDefaultSecretName({ username, url })}-`;
  const labels = {
    [VCENTER_TYPE_LABEL]: 'true',
  };
  if (isTemporary) {
    // if set, the Secret is not listed for selection within the dropdown box and is automatically garbage-collected (by controller)
    labels[VCENTER_TEMPORARY_LABEL] = 'true'; // will be automatically garbage-collected by the controller
  }

  return {
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
};

import { get, has } from 'lodash';

import { getVmwareSecretLabels } from '../../../selectors/v2v';
import { VCENTER_TEMPORARY_LABEL } from '../../../constants';
import { addLabelToVmwareSecretPatch, removeLabelFromVmwareSecretPatch } from '../../../utils';
import { SecretModel } from '../../../models';

export const correctVCenterSecretLabels = async ({ secret, saveCredentialsRequested }, { k8sPatch }) => {
  if (secret) {
    const hasTempLabel = has(getVmwareSecretLabels(secret), VCENTER_TEMPORARY_LABEL);

    if (saveCredentialsRequested && hasTempLabel) {
      const patch = removeLabelFromVmwareSecretPatch(VCENTER_TEMPORARY_LABEL);
      return k8sPatch(SecretModel, secret, [
        patch,
        {
          op: 'remove',
          path: `/metadata/ownerReferences`,
        },
      ]).catch(err => {
        if (!get(err, 'message').includes('Unable to remove nonexistent key')) {
          console.error(err); // eslint-disable-line no-console
        }
      });
    }

    if (!saveCredentialsRequested && !hasTempLabel) {
      const patch = addLabelToVmwareSecretPatch(VCENTER_TEMPORARY_LABEL);
      return k8sPatch(SecretModel, secret, patch).catch(err => console.log(err)); // eslint-disable-line no-console
    }
  }
  return null;
};

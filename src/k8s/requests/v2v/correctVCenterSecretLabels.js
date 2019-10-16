import { get, has } from 'lodash';

import { getVmwareSecretLabels } from '../../../selectors/v2v';
import { VCENTER_TEMPORARY_LABEL } from '../../../constants';
import { addLabelToVmwareSecretPatch, removeLabelFromVmwareSecretPatch } from '../../../utils';
import { SecretModel } from '../../../models';

export const correctVCenterSecretLabels = async ({ secret, saveCredentialsRequested }, { k8sPatch }) => {
  if (secret) {
    const hasTempLabel = has(getVmwareSecretLabels(secret), VCENTER_TEMPORARY_LABEL);

    if (saveCredentialsRequested && hasTempLabel) {
      const patches = removeLabelFromVmwareSecretPatch(VCENTER_TEMPORARY_LABEL);
      patches.push({
        op: 'remove',
        path: '/metadata/ownerReferences',
      });
      return k8sPatch(SecretModel, secret, patches).catch(err => {
        if (!get(err, 'message').includes('Unable to remove nonexistent key')) {
          console.error(err); // eslint-disable-line no-console
        }
      });
    }

    if (!saveCredentialsRequested && !hasTempLabel) {
      const patches = addLabelToVmwareSecretPatch(VCENTER_TEMPORARY_LABEL);
      return k8sPatch(SecretModel, secret, patches).catch(err => console.log(err)); // eslint-disable-line no-console
    }
  }
  return null;
};

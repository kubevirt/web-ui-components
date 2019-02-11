import { get } from 'lodash';
import { SecretModel } from '../../../../models';
import { getImportProviderSecretObject, getDefaultSecretName } from './vmwareProviderPod';

import {
  NAMESPACE_KEY,
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  PROVIDER_STATUS_SUCCESS,
  PROVIDER_VMWARE_URL_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_KEY,
} from '../constants';

const getRandomString = length => Math.random().toString(36).substr(2, length);

export const onVmwareCheckConnection = (basicSettings, onChange, k8sCreate) => {
  // Note: any user changes since issuing the Check-button action till it's finish will be lost due to tight binding of the onFormChange to basicSettings set at promise creation
  onChange({status: PROVIDER_STATUS_CONNECTING});

  const url = get(basicSettings[PROVIDER_VMWARE_URL_KEY], 'value');
  const username = get(basicSettings[PROVIDER_VMWARE_USER_NAME_KEY], 'value');
  const password = get(basicSettings[PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY], ['value', PROVIDER_VMWARE_USER_PWD_KEY]);
  const namespace = get(basicSettings[NAMESPACE_KEY], 'value');
  const secretName = `temp-${getDefaultSecretName({ url, username })}-${getRandomString(5)}`;

  k8sCreate(SecretModel, getImportProviderSecretObject({url, username, password, namespace, secretName})).then(() => {
    // TODO: use the just created secret and spawn a Connection pod and query it
    // TODO:can we delete the temp-secret right after POD's creation? If not we can potentialy schedule the deletion by setTimeout() or using pod's finalizer
    window.setTimeout(() => {
      onChange({ status: PROVIDER_STATUS_SUCCESS })
    }, 2000);
  }, reason => {
    console.warn('onVmwareCheckConnection(): Creation of vCenter credentials Secret failed, reason: ', reason);
    onChange({ status: PROVIDER_STATUS_CONNECTION_FAILED });
  });
};

// secret already exists, use it
// TODO:
// - kill potentially existing Connection pod
//    - see prevBasicSettings if any previously created
// - create new pod instance
// Connection POD spawn:
// - store unique ID in basicSettings
// - createPod with the secret and a label with the unique value
// - wrap the VMList dropdown to
//    - WithResources for the given pod
//    - another component querying the pod for the list of VMs
export const onVCenterInstanceSelected = ({ value, validation }, key, formValid, prevBasicSettings, onFormChange) => {
  // onFormChange: (newValue, key, formValid) => {} to update basicSettings
  console.log('--- TODO: onVCenterInstanceSelected: ', value, validation, key, formValid, prevBasicSettings, onFormChange);
};

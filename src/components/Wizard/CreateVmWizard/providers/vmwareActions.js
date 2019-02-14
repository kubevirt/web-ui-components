import { get } from 'lodash';
import {DeploymentModel, SecretModel, V2VVMwareModel} from '../../../../models';
import { getImportProviderSecretObject, getDefaultSecretName, getV2VVMwareObject } from './vmwareProviderPod';

import {
  NAMESPACE_KEY,
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  PROVIDER_VMWARE_URL_KEY,
  PROVIDER_VMWARE_USER_NAME_KEY,
  PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
  PROVIDER_VMWARE_USER_PWD_KEY,
  PROVIDER_VMWARE_CONNECTION,
} from '../constants';
import {CONNECT_TO_NEW_INSTANCE} from '../strings';

export const onVmwareCheckConnection = async (basicSettings, onChange, k8sCreate) => {
  // Note: any changes to the dialog since issuing the Check-button action till it's finish will be lost due to tight binding of the onFormChange to basicSettings set at promise creation
  onChange({status: PROVIDER_STATUS_CONNECTING});

  const url = get(basicSettings[PROVIDER_VMWARE_URL_KEY], 'value');
  const username = get(basicSettings[PROVIDER_VMWARE_USER_NAME_KEY], 'value');
  const password = get(basicSettings[PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY], ['value', PROVIDER_VMWARE_USER_PWD_KEY]);
  const namespace = get(basicSettings[NAMESPACE_KEY], 'value');
  // const secretName = `temp-${getDefaultSecretName({ url, username })}-${getRandomString(5)}`;
  const secretName = `temp-${getDefaultSecretName({ url, username })}-`;

  try {
    // TODO: set owner reference to delete this secret along the v2vVmware
    const secret = await k8sCreate(SecretModel, getImportProviderSecretObject({
      url,
      username,
      password,
      namespace,
      secretName
    }));

    // TODO: when is this object deleted? Controller can collect garbage based on a timeToLive label (can be set by the controller itself, if missing)
    const v2vVmware = await k8sCreate(V2VVMwareModel, getV2VVMwareObject({
      name: `check-${getDefaultSecretName({ url, username })}-`,
      namespace,
      connectionSecretName: secret.metadata.name,
      listVmsRequest: false
    }));

    onChange({ V2VVmwareName: v2vVmware.metadata.name, status: PROVIDER_STATUS_CONNECTING }) // still "connecting" here, let content in the "status" of the CR decide otherwise (set by controller)
  } catch (err) {
    console.warn('onVmwareCheckConnection(): Check for VMWare credentials failed, reason: ', err);
    onChange({ status: PROVIDER_STATUS_CONNECTION_FAILED }); // The CR can not be created
  }
};

// secret already exists, use it
export const onVCenterInstanceSelected = async (k8sCreate, valueValidationPair, key, formValid, prevBasicSettings, onFormChange) => {
  // onFormChange: (newValue, key, formValid) => {} to update basicSettings
  const { value } = valueValidationPair;
  const connectionSecretName = value;
  if (!connectionSecretName || connectionSecretName === CONNECT_TO_NEW_INSTANCE) {
    return ;
  }

  const namespace = get(prevBasicSettings, [NAMESPACE_KEY, 'value']);
  console.log('--- onVCenterInstanceSelected: ', connectionSecretName);

  // TODO: when is this object deleted?
  const v2vVmware = await k8sCreate(V2VVMwareModel, getV2VVMwareObject({
    name: `v2vvmware-${connectionSecretName}-`,
    namespace,
    connectionSecretName,
    listVmsRequest: true
  }));

  // reuse PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY for storing reference to the just created V2VVMWare object
  onFormChange(
    {
      [PROVIDER_VMWARE_CONNECTION]: {
        V2VVmwareName: v2vVmware.metadata.name,
        status: PROVIDER_STATUS_CONNECTING, // useless value
      }
    },
    PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
    formValid,
  );
};

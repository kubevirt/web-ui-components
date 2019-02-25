import { get } from 'lodash';

import { SecretModel, V2VVMwareModel } from '../../../../models';
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
import { CONNECT_TO_NEW_INSTANCE } from '../strings';
import { settingsValue } from '../../../../k8s/selectors';
import { getName } from '../../../../utils/selectors';

export const onVmwareCheckConnection = async (basicSettings, onChange, k8sCreate) => {
  // Note: any changes to the dialog since issuing the Check-button action till it's finish will be lost due to tight binding of the onFormChange to basicSettings set at promise creation
  onChange({ status: PROVIDER_STATUS_CONNECTING });

  const url = settingsValue(basicSettings, PROVIDER_VMWARE_URL_KEY);
  const username = settingsValue(basicSettings, PROVIDER_VMWARE_USER_NAME_KEY);
  const password = get(
    settingsValue(basicSettings, PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY),
    PROVIDER_VMWARE_USER_PWD_KEY
  );
  const namespace = settingsValue(basicSettings, NAMESPACE_KEY);

  try {
    const secretName = `temp-${getDefaultSecretName({ url, username })}-`;
    const secret = await k8sCreate(
      SecretModel,
      getImportProviderSecretObject({
        url,
        username,
        password,
        namespace,
        secretName,
        isTemporary: true, // do not list this temporary secret in the dropdown box
      })
    );

    const v2vVmware = await k8sCreate(
      V2VVMwareModel,
      getV2VVMwareObject({
        name: `check-${getDefaultSecretName({ url, username })}-`,
        namespace,
        connectionSecretName: getName(secret),
        isTemporary: true, // remove this object automatically (by controller)
      })
    );

    onChange({ V2VVmwareName: getName(v2vVmware), status: PROVIDER_STATUS_CONNECTING }); // still "connecting" here, let content in the "status" of the CR decide otherwise (set by controller)
  } catch (err) {
    console.warn('onVmwareCheckConnection(): Check for VMWare credentials failed, reason: ', err); // eslint-disable-line no-console
    onChange({ status: PROVIDER_STATUS_CONNECTION_FAILED }); // The CR can not be created
  }
};

// secret already exists, use it
export const onVCenterInstanceSelected = async (
  k8sCreate,
  valueValidationPair,
  key,
  formValid,
  prevBasicSettings,
  onFormChange
) => {
  // hint: onFormChange = (newValue, key, formValid) => {} to update basicSettings
  const { value } = valueValidationPair;
  const connectionSecretName = value;
  if (!connectionSecretName || connectionSecretName === CONNECT_TO_NEW_INSTANCE) {
    setTimeout(() => {
      // let other events to be processed
      onFormChange(
        // empty the VMs list dropdown
        {
          value: {
            [PROVIDER_VMWARE_CONNECTION]: {
              V2VVmwareName: '',
            },
          },
        },
        PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
        formValid
      );
    }, 100);
    return;
  }

  const namespace = settingsValue(prevBasicSettings, NAMESPACE_KEY);

  // ATM, Kubernetes does not support deletion of CRs with a gracefulPeriod (delayed deletion).
  // The only object with this support are PODs.
  // More info: https://github.com/kubernetes/kubernetes/issues/56567
  // Workaround: handle garbage collection on our own by:
  // - set VCENTER_TEMPORARY_LABEL label to 'true'
  // - controller will set deletionTimestamp label with RFC 3339 timestamp
  // - controller will remove the object after the timeStamp
  // - can be easily extended for delaying the deletionTimestamp (recently not needed, so not implemented)

  const v2vVmware = await k8sCreate(
    V2VVMwareModel,
    getV2VVMwareObject({
      name: `v2vvmware-${connectionSecretName}-`,
      namespace,
      connectionSecretName,
      isTemporary: true, // remove this object automatically (by controller)
    })
  );

  // reuse PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY for storing reference to the just created V2VVMWare object (onVmwareCheckConnection())
  onFormChange(
    {
      value: {
        [PROVIDER_VMWARE_CONNECTION]: {
          V2VVmwareName: getName(v2vVmware),
          status: PROVIDER_STATUS_CONNECTING, // useless value
        },
      },
    },
    PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
    formValid
  );
};

export const onVCenterVmSelectedConnected = async (
  k8sCreate,
  k8sGet,
  k8sPatch,
  valueValidationPair,
  key,
  formValid,
  prevBasicSettings,
  onFormChange
) => {
  const { value } = valueValidationPair; // name of VM to be imported
  const namespace = settingsValue(prevBasicSettings, NAMESPACE_KEY);

  // see onVCenterInstanceSelected()
  const V2VVmwareName = get(settingsValue(settingsValue, PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY), [
    PROVIDER_VMWARE_CONNECTION,
    'V2VVmwareName',
  ]);
  const vmName = (value || '').trim();

  try {
    // The V2VVMWare object can be reused from the VCenterVmsConnected component or re-queried here. The later option helps to minimize conflicts.
    const v2vvmware = await k8sGet(V2VVMwareModel, V2VVmwareName, namespace);

    // Strategic merge patches seem not to work, so let's do mapping via positional arrays.
    // Probably not a big deal as the controller is designed to avoid VMs list refresh
    const index = get(v2vvmware, 'spec.vms', []).findIndex(vm => vm.name === vmName);
    if (index >= 0) {
      const patch = [
        {
          op: 'replace',
          path: `/spec/vms/${index}/detailRequest`,
          value: true,
        },
      ];
      await k8sPatch(V2VVMwareModel, v2vvmware, patch); // the controller will supply details for the selected VM
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        'onVCenterVmSelectedConnected: The retrieved V2VVMware object is missing desired VM: "',
        vmName,
        '", ',
        v2vvmware
      );
    }
  } catch (reason) {
    // TODO: notify user
    // eslint-disable-next-line no-console
    console.warn(
      'onVCenterVmSelectedConnected: Failed to patch the V2VVMWare object to query VM details: "',
      vmName,
      '", namespace: "',
      namespace,
      '", reason: ',
      reason
    );
  }
};

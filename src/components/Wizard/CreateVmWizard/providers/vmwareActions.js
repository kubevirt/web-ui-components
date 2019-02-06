import {
  PROVIDER_STATUS_CONNECTING,
  PROVIDER_STATUS_CONNECTION_FAILED,
  PROVIDER_STATUS_SUCCESS,
} from '../constants';

const createVMWareConnectionSecret = ({ url, username, password }) => {

};

// TODO:
// - create temporal secret using getImportProviderSecretObject()
// - spawn a Connection pod and query it
// - store/clear result (PROVIDER_VMWARE_CONNECTION)
export const onVmwareCheckConnection = (basicSettings, onChange) => {
  // any user changes since issuing the Check-button action till it's finish will be lost due to tight binding of the onFormChange to basicSettings set at promise creation
  console.log('--- TODO: onVmwareCheckConnection: ', basicSettings, onChange);
  onChange({ status: PROVIDER_STATUS_CONNECTING });
  window.setTimeout(() => onChange({ status: PROVIDER_STATUS_SUCCESS }), 2000);
  window.setTimeout(() => onChange({ status: PROVIDER_STATUS_CONNECTION_FAILED }), 2000+1000);


};

// TODO:
// - kill potentially existing Connection pod
// - create new pod instance
export const onVCenterInstanceSelected = ({ value, validation }, key, formValid) => {
  console.log('--- TODO: onVCenterInstanceSelected: ', value, validation, key, formValid);
};

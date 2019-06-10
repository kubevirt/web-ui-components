import { PROVIDERS_DATA_KEY } from '../../../constants';
import { PROVIDER_VMWARE, PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY, PROVIDER_VMWARE_STATUS_KEY } from '../constants';
import { V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL } from '../../../../../../utils/status/v2vVMware';
import { VMWareImportProvider } from '../VMWareImportProvider';

export const vmSettingsConnectionSuccessful = {
  [PROVIDERS_DATA_KEY]: {
    [PROVIDER_VMWARE]: {
      [PROVIDER_VMWARE_STATUS_KEY]: {
        value: V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL,
      },
    },
  },
};

export const vmSettingsDontSaveCredentials = {
  [PROVIDERS_DATA_KEY]: {
    [PROVIDER_VMWARE]: {
      [PROVIDER_VMWARE_STATUS_KEY]: {
        value: V2V_WMWARE_STATUS_CONNECTION_SUCCESSFUL,
      },
      [PROVIDER_VMWARE_REMEMBER_PASSWORD_KEY]: {
        value: false,
      },
    },
  },
};

export default {
  component: VMWareImportProvider,
  props: {
    vmSettings: vmSettingsConnectionSuccessful,
  },
};

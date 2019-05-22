// Do clean-up
import { get } from 'lodash';

import { NAMESPACE_KEY } from '../../constants';
import { getVmwareField } from './selectors';
import { PROVIDER_VMWARE_V2V_NAME_KEY } from './constants';
import { V2VVMwareModel } from '../../../../../models';
import { getVmSettingValue } from '../../utils/vmSettingsTabUtils';

export const cleanupVmWareProvider = async options => {
  const { id, props, getState } = options;
  const state = getState();

  const v2vvmwareName = getVmwareField(state, id, PROVIDER_VMWARE_V2V_NAME_KEY);
  if (v2vvmwareName) {
    // This is a friendly help to keep things clean.
    // If missed here (e.g. when the browser window is closed), the kubevirt-vmware controller's garbage
    // collector will do following automatically after a delay.
    const resource = {
      metadata: {
        name: v2vvmwareName,
        namespace: getVmSettingValue(state, id, NAMESPACE_KEY),
      },
    };
    try {
      await props.k8sKill(V2VVMwareModel, resource);
    } catch (error) {
      if (get(error, 'json.code') !== 404 && get(error, 'json.reason') !== 'NotFound') {
        // eslint-disable-next-line no-console
        console.log(
          'Failed to remove temporary V2VVMWare object. It is not an issue, it will be garbage collected later if still present, resource: ',
          resource,
          ', error: ',
          error
        );
      }
    }
  }
};

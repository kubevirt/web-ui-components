// Do clean-up
import { settingsValue } from '../../../../../k8s/selectors';
import { NAMESPACE_KEY } from '../../constants';
import { getVmwareField } from './selectors';
import { PROVIDER_VMWARE_V2V_NAME_KEY } from './constants';
import { V2VVMwareModel } from '../../../../../models';

export const cleanupVmWareProvider = async (vmSettings, callerContext) => {
  const v2vvmwareName = getVmwareField(vmSettings, PROVIDER_VMWARE_V2V_NAME_KEY);
  if (v2vvmwareName) {
    // This is a friendly help to keep things clean.
    // If missed here (e.g. when the browser window is closed), the kubevirt-vmware controller's garbage
    // collector will do following automatically after a delay.
    const resource = {
      metadata: {
        name: v2vvmwareName,
        // TODO: potential issue if the user changed the namespace after creation of the v2vvmware object
        // to fix: either store the namespace along the v2vvmwareName or empty v2vvmwareName on namespace change
        namespace: settingsValue(vmSettings, NAMESPACE_KEY),
      },
    };
    try {
      await callerContext.k8sKill(V2VVMwareModel, resource);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(
        'Failed to remove temporary V2VVMWare object. It is not an issue, it will be garbage collected later if still present, resource: ',
        resource,
        ', error: ',
        error
      );
    }
  }
};

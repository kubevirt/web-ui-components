import { VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACES, VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME } from './constants';
import { ConfigMapModel } from '../../../models';

const { info, warn } = console;

const getVmwareConfigMapInNamespace = async ({ k8sGet, namespace }) => {
  try {
    return await k8sGet(ConfigMapModel, VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME, namespace, null, {
      disableHistory: true,
    });
  } catch (e) {
    info(
      `The ${VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME} can not be found in the ${namespace} namespace.  Another namespace will be queried, if any left. Error: `,
      e
    );
  }
  return null;
};

// The "v2v-vmware" ConfigMap is expected to be created by a v2v operator which is currecntly under development.
// In the meantime, see https://github.com/kubevirt/web-ui-components/pull/507 for example.
export const getVmwareConfigMap = async props => {
  // query namespaces sequentially to respect order
  for (let index = 0; index < VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACES.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    const configMap = await getVmwareConfigMapInNamespace({
      namespace: VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACES[index],
      ...props,
    });
    if (configMap) {
      return configMap;
    }
  }
  warn(
    `The ${VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAME} can not be found in none of following namespaces: `,
    JSON.stringify(VMWARE_KUBEVIRT_VMWARE_CONFIG_MAP_NAMESPACES),
    '. The v2v pods can not be created.'
  );
  return null;
};

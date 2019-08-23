import { STORAGE_CLASS_CONFIG_MAP_NAME, STORAGE_CLASS_CONFIG_MAP_NAMESPACES } from './constants';
import { ConfigMapModel } from '../../../models';

const { info, warn } = console;

const getStorageClassConfigMapInNamespace = async ({ k8sGet, namespace }) => {
  try {
    return await k8sGet(ConfigMapModel, STORAGE_CLASS_CONFIG_MAP_NAME, namespace, null, { disableHistory: true });
  } catch (e) {
    info(
      `The ${STORAGE_CLASS_CONFIG_MAP_NAME} can not be found in the ${namespace} namespace. Another namespace will be queried, if any left. Error: `,
      e
    );
  }
  return null;
};

export const getStorageClassConfigMap = async props => {
  // query namespaces sequentially to respect order
  for (let index = 0; index < STORAGE_CLASS_CONFIG_MAP_NAMESPACES.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    const configMap = await getStorageClassConfigMapInNamespace({
      namespace: STORAGE_CLASS_CONFIG_MAP_NAMESPACES[index],
      ...props,
    });
    if (configMap) {
      return configMap;
    }
  }
  warn(
    `The ${STORAGE_CLASS_CONFIG_MAP_NAME} can not be found in none of following namespaces: `,
    JSON.stringify(STORAGE_CLASS_CONFIG_MAP_NAMESPACES),
    '. The PVCs will be created with default values.'
  );
  return null;
};

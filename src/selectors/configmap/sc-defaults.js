import { get } from 'lodash';

import { PVC_ACCESSMODE_DEFAULT, PVC_VOLUMEMODE_DEFAULT } from '../../constants';

export const getDefaultSCAccessMode = (storageClassConfigMap, scName) => {
  const defaultAccessMode = get(storageClassConfigMap, ['data', 'accessMode'], PVC_ACCESSMODE_DEFAULT);
  return get(storageClassConfigMap, ['data', `${scName}.accessMode`], defaultAccessMode);
};

export const getDefaultSCVolumeMode = (storageClassConfigMap, scName) => {
  const defaultVolumeMode = get(storageClassConfigMap, ['data', 'volumeMode'], PVC_VOLUMEMODE_DEFAULT);
  return get(storageClassConfigMap, ['data', `${scName}.volumeMode`], defaultVolumeMode);
};

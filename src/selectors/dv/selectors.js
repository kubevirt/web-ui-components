import { get } from 'lodash';

import {
  DATA_VOLUME_SOURCE_URL,
  DATA_VOLUME_SOURCE_PVC,
  DATA_VOLUME_SOURCE_BLANK,
} from '../../components/Wizard/CreateVmWizard/constants';

import { getStorageSize } from '../common';

export const getDataVolumeStorageSize = dataVolume => getStorageSize(getDataVolumeResources(dataVolume));
export const getDataVolumeResources = dataVolume => get(dataVolume, 'spec.pvc.resources');
export const getDataVolumeAccessModes = dataVolume => get(dataVolume, 'spec.pvc.accessModes');
export const getDataVolumeStorageClassName = dataVolume => get(dataVolume, 'spec.pvc.storageClassName');

export const getDataVolumeSourceType = dataVolume => {
  const source = get(dataVolume, 'spec.source');
  if (source.http) {
    return {
      type: DATA_VOLUME_SOURCE_URL,
      url: get(dataVolume, 'spec.source.http.url'),
    };
  }
  if (source.pvc) {
    return {
      type: DATA_VOLUME_SOURCE_PVC,
      name: get(dataVolume, 'spec.source.pvc.name'),
      namespace: get(dataVolume, 'spec.source.pvc.namespace'),
    };
  }
  if (source.blank) {
    return {
      type: DATA_VOLUME_SOURCE_BLANK,
    };
  }
  return null;
};

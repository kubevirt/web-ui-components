import { PersistentVolumeClaimModel } from '../../../models/index';
import { PVC_ACCESSMODE_RWM } from '../../../constants';

export const buildPvc = ({ generateName, namespace, size, unit, storageClass }) => ({
  apiVersion: PersistentVolumeClaimModel.apiVersion,
  kind: PersistentVolumeClaimModel.kind,
  metadata: {
    namespace,
    generateName: `${generateName}-`,
  },
  spec: {
    accessModes: [PVC_ACCESSMODE_RWM],
    volumeMode: 'Filesystem',
    resources: {
      requests: {
        storage: `${size}${unit}`,
      },
    },
    storageClassName: storageClass,
  },
});

import { PersistentVolumeClaimModel } from '../../../models/index';

export const buildPvc = ({ generateName, namespace, size, unit, storageClass }) => ({
  apiVersion: PersistentVolumeClaimModel.apiVersion,
  kind: PersistentVolumeClaimModel.kind,
  metadata: {
    namespace,
    generateName: `${generateName}-`,
  },
  spec: {
    accessModes: ['ReadWriteOnce'],
    volumeMode: 'Filesystem',
    resources: {
      requests: {
        storage: `${size}${unit}`,
      },
    },
    storageClassName: storageClass,
  },
});

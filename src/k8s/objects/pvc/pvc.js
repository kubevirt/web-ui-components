import { PersistentVolumeClaimModel } from '../../../models/index';

export const buildPvc = ({ generateName, namespace, storageType, size, storageClass }) => ({
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
        storage: `${size}Gi`,
      },
    },
    storageClassName: storageClass,
  },
});

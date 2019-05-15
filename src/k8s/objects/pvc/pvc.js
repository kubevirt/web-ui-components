import { PersistentVolumeClaimModel } from '../../../models/index';
import { getValidK8SSize } from '../../../utils';

export const buildPvc = ({ generateName, namespace, storageType, size, storageClass, units }) => ({
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
        storage: getValidK8SSize(size, units, 'Gi', true),
      },
    },
    storageClassName: storageClass,
  },
});

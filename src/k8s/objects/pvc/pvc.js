import { PersistentVolumeClaimModel } from '../../../models/index';
import { PVC_ACCESSMODE_RWM, PVC_VOLUMEMODE_FS } from '../../../constants';

export const buildPvc = ({
  generateName,
  namespace,
  size,
  unit,
  storageClassName,
  accessMode = PVC_ACCESSMODE_RWM,
  volumeMode = PVC_VOLUMEMODE_FS,
}) => ({
  apiVersion: PersistentVolumeClaimModel.apiVersion,
  kind: PersistentVolumeClaimModel.kind,
  metadata: {
    namespace,
    generateName: `${generateName}-`,
  },
  spec: {
    accessModes: [accessMode],
    volumeMode,
    resources: {
      requests: {
        storage: `${size}${unit}`,
      },
    },
    storageClassName,
  },
});

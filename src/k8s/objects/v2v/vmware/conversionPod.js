import { PodModel } from '../../../../models';
import {
  CONVERSION_BASE_NAME,
  CONVERSION_GENERATE_NAME,
  CONVERSION_VDDK_INIT_POD_NAME,
  CONVERSION_VOLUME_VDDK_NAME,
  CONVERSION_VDDK_MOUNT_PATH,
} from '../../../requests/v2v';

export const buildConversionPod = ({
  volumes,
  volumeMounts,
  namespace,
  serviceAccountName,
  secretName,
  imagePullPolicy,
  image,
  vddkInitImage,
}) => ({
  apiVersion: PodModel.apiVersion,
  kind: PodModel.kind,
  metadata: {
    generateName: CONVERSION_GENERATE_NAME,
    namespace,
  },
  spec: {
    serviceAccountName,

    initContainers: [
      {
        name: CONVERSION_VDDK_INIT_POD_NAME,
        image: vddkInitImage,
        volumeMounts: [
          {
            name: CONVERSION_VOLUME_VDDK_NAME,
            mountPath: CONVERSION_VDDK_MOUNT_PATH,
          },
        ],
      },
    ],

    containers: [
      {
        name: CONVERSION_BASE_NAME,
        imagePullPolicy,
        image,
        securityContext: {
          privileged: true,
        },
        volumeMounts: [
          {
            name: 'configuration',
            mountPath: '/data/input',
          },
          {
            name: 'kvm',
            mountPath: '/dev/kvm',
          },
          {
            name: CONVERSION_VOLUME_VDDK_NAME,
            mountPath: CONVERSION_VDDK_MOUNT_PATH,
          },
          ...volumeMounts,
        ],
      },
    ],
    volumes: [
      {
        name: 'configuration',
        secret: {
          secretName,
        },
      },
      {
        name: 'kvm',
        hostPath: {
          path: '/dev/kvm',
        },
      },
      {
        name: CONVERSION_VOLUME_VDDK_NAME,
        emptyDir: {},
      },
      ...volumes,
    ],
    restartPolicy: 'Never',
  },
});

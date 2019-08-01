import { PodModel } from '../../../../models';
import {
  CONVERSION_BASE_NAME,
  CONVERSION_GENERATE_NAME,
  VMWARE_VDDK_INIT,
  VMWARE_VOLUME_VDDK,
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
        name: VMWARE_VDDK_INIT,
        image: vddkInitImage,
        volumeMounts: [
          {
            name: VMWARE_VOLUME_VDDK,
            mountPath: '/opt/vmware-vix-disklib-distrib',
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
            name: VMWARE_VOLUME_VDDK,
            mountPath: '/opt/vmware-vix-disklib-distrib',
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
        name: VMWARE_VOLUME_VDDK,
        emptyDir: {},
      },
      ...volumes,
    ],
    restartPolicy: 'Never',
  },
});

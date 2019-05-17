import { getKubevirtV2vConversionContainerImage, getV2vImagePullPolicy } from '../../../../config';
import { PodModel } from '../../../../models';
import { CONVERSION_BASE_NAME, CONVERSION_GENERATE_NAME } from '../../../requests/v2v';

export const buildConversionPod = ({ volumes, volumeMounts, namespace, serviceAccountName, secretName }) => ({
  apiVersion: PodModel.apiVersion,
  kind: PodModel.kind,
  metadata: {
    generateName: CONVERSION_GENERATE_NAME,
    namespace,
  },
  spec: {
    serviceAccountName,
    containers: [
      {
        name: CONVERSION_BASE_NAME,
        imagePullPolicy: getV2vImagePullPolicy(),
        image: getKubevirtV2vConversionContainerImage(),
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
      ...volumes,
    ],
    restartPolicy: 'Never',
  },
});

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
        image: 'quay.io/nyoxi/kubevirt-v2v-conversion:1.12.1-1-gf665c0a', // TODO: parametrize from configuration (Web UI's ConfigMap)
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

import { getKubevirtV2vVmwareContainerImage } from '../../../../config';
import { DeploymentModel } from '../../../../models';

export const buildVmWareDeployment = ({ name, namespace }) => ({
  apiVersion: `${DeploymentModel.apiGroup}/${DeploymentModel.apiVersion}`,
  kind: DeploymentModel.kind,
  metadata: {
    name,
    namespace,
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        name,
      },
    },
    template: {
      metadata: {
        labels: {
          name,
        },
      },
      spec: {
        serviceAccountName: name,
        containers: [
          {
            name,
            image: getKubevirtV2vVmwareContainerImage(),
            imagePullPolicy: 'Always',
            command: ['kubevirt-vmware'],
            env: [
              {
                name: 'WATCH_NAMESPACE',
                valueFrom: {
                  fieldRef: {
                    apiVersion: 'v1',
                    fieldPath: 'metadata.namespace',
                  },
                },
              },
              {
                name: 'POD_NAME',
                valueFrom: {
                  fieldRef: {
                    apiVersion: 'v1',
                    fieldPath: 'metadata.name',
                  },
                },
              },
              {
                name: 'OPERATOR_NAME',
                value: name,
              },
            ],
          },
        ],
      },
    },
  },
});

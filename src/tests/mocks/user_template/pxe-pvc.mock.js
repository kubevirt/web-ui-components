import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  ANNOTATION_FIRST_BOOT,
  ANNOTATION_PXE_INTERFACE,
} from '../../../constants';

export const pxePvcTemplate = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    labels: {
      'flavor.template.kubevirt.io/small': 'true',
      'os.template.kubevirt.io/fedora29': 'true',
      'template.kubevirt.io/type': 'vm',
      [LABEL_USED_TEMPLATE_NAME]: 'fedora-generic',
      [LABEL_USED_TEMPLATE_NAMESPACE]: 'default',
      'workload.template.kubevirt.io/generic': 'true',
    },
    annotations: {
      'name.os.template.kubevirt.io/fedora29': 'Fedora 29',
    },
    name: 'pxe-template-pvc',
    namespace: 'myproject',
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha3',
      kind: 'VirtualMachine',
      metadata: {
        annotations: {
          [ANNOTATION_FIRST_BOOT]: 'true',
          [ANNOTATION_PXE_INTERFACE]: 'eth1',
        },
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}',
      },
      spec: {
        template: {
          spec: {
            domain: {
              cpu: {
                cores: 2,
              },
              devices: {
                disks: [
                  {
                    bootOrder: 2,
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
                  },
                ],
                interfaces: [
                  {
                    bridge: {},
                    name: 'eth0',
                  },
                  {
                    bootOrder: 1,
                    bridge: {},
                    name: 'eth1',
                  },
                ],
                rng: {},
              },
              resources: {
                requests: {
                  memory: '2G',
                },
              },
            },
            networks: [
              {
                name: 'eth0',
                pod: {},
              },
              {
                multus: {
                  networkName: 'pxe-net-conf',
                },
                name: 'eth1',
              },
            ],
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                name: 'rootdisk',
                persistentVolumeClaim: {
                  claimName: 'rootdisk',
                },
              },
            ],
          },
        },
      },
    },
  ],
  parameters: [
    {
      description: 'Name for the new VM',
      name: 'NAME',
    },
  ],
};

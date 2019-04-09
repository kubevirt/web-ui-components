import { LABEL_USED_TEMPLATE_NAME, LABEL_USED_TEMPLATE_NAMESPACE } from '../../../constants';
import { LONG_ISO_URL } from './url.mock';

export const urlNoNetworkTemplate = {
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
    name: 'url-template-nonetwork',
    namespace: 'myproject',
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha3',
      kind: 'VirtualMachine',
      metadata: {
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}',
      },
      spec: {
        dataVolumeTemplates: [
          {
            metadata: {
              // eslint-disable-next-line no-template-curly-in-string
              name: 'rootdisk-${NAME}',
            },
            spec: {
              pvc: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '10Gi',
                  },
                },
              },
              source: {
                http: {
                  url: LONG_ISO_URL,
                },
              },
            },
          },
        ],
        template: {
          spec: {
            domain: {
              cpu: {
                cores: 2,
              },
              devices: {
                autoattachPodInterface: false,
                disks: [
                  {
                    bootOrder: 1,
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
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
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                dataVolume: {
                  // eslint-disable-next-line no-template-curly-in-string
                  name: 'rootdisk-${NAME}',
                },
                name: 'rootdisk',
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

import { LABEL_USED_TEMPLATE_NAME, LABEL_USED_TEMPLATE_NAMESPACE } from '../../../constants';

export const LONG_ISO_URL =
  'http://rock.mountain.all-images.cz/mirrors/there-was-a-toad/on/a/blue/happy/road/0.12.13/isos/x86_64/dromaeosauridae.iso?a=1&b=caaaaaaaaaaddddddddaaaaaaa#here';

export const urlTemplate = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    annotations: {
      description: 'foo description',
      'name.os.template.kubevirt.io/fedora29': 'Fedora 29',
    },
    labels: {
      'flavor.template.kubevirt.io/small': 'true',
      'os.template.kubevirt.io/fedora29': 'true',
      'template.kubevirt.io/type': 'vm',
      [LABEL_USED_TEMPLATE_NAME]: 'fedora-generic',
      [LABEL_USED_TEMPLATE_NAMESPACE]: 'default',
      'workload.template.kubevirt.io/generic': 'true',
    },
    name: 'url-template',
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
        template: {
          spec: {
            domain: {
              cpu: {
                cores: 2,
              },
              devices: {
                disks: [
                  {
                    bootOrder: 1,
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
            ],
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                dataVolume: {
                  // eslint-disable-next-line no-template-curly-in-string
                  name: 'url-template-rootdisk',
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

export const urlTemplateDataVolume = {
  metadata: {
    // eslint-disable-next-line no-template-curly-in-string
    name: 'url-template-rootdisk',
    namespace: 'myproject',
  },
  spec: {
    pvc: {
      accessModes: ['ReadWriteOnce'],
      resources: {
        requests: {
          storage: '5Gi',
        },
      },
    },
    source: {
      http: {
        url: LONG_ISO_URL,
      },
    },
  },
};

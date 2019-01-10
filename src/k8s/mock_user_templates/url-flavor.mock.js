export const urlCustomFlavorTemplate = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    labels: {
      'flavor.template.cnv.io/Custom': 'true',
      'os.template.cnv.io/fedora29': 'true',
      'template.cnv.io/type': 'vm',
      'template.cnv.ui': 'default_fedora-generic',
      'workload.template.cnv.io/generic': 'true',
    },
    annotations: {
      'name.os.template.cnv.io/fedora29': 'Fedora 29',
    },
    name: 'url-template-custom-flavor',
    namespace: 'myproject',
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha2',
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
                  url: 'fooUrl',
                },
              },
            },
          },
        ],
        template: {
          spec: {
            domain: {
              cpu: {
                cores: 1,
              },
              devices: {
                disks: [
                  {
                    bootOrder: 1,
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
                    volumeName: 'rootdisk',
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
                  memory: '1G',
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

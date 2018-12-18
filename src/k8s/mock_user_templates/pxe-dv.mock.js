export const pxeDataVolumeTemplate = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    labels: {
      'flavor.template.cnv.io/small': 'true',
      'os.template.cnv.io/fedora29': 'true',
      'template.cnv.io/type': 'vm',
      'template.cnv.ui': 'default_fedora-generic',
      'workload.template.cnv.io/generic': 'true',
    },
    annotations: {
      'name.os.template.cnv.io/fedora29': 'Fedora 29',
    },
    name: 'pxe-template-dv',
    namespace: 'myproject',
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha2',
      kind: 'VirtualMachine',
      metadata: {
        annotations: {
          'cnv.ui.firstBoot': 'true',
          'cnv.ui.pxeInterface': 'eth1',
        },
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}',
      },
      spec: {
        dataVolumeTemplates: [
          {
            metadata: {
              // eslint-disable-next-line no-template-curly-in-string
              name: 'fooDvDisk-${NAME}',
            },
            spec: {
              pvc: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '15Gi',
                  },
                },
              },
              source: {
                blank: {},
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
                disks: [
                  {
                    bootOrder: 2,
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'fooDvDisk',
                    volumeName: 'fooDvDisk',
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
                dataVolume: {
                  // eslint-disable-next-line no-template-curly-in-string
                  name: 'fooDvDisk-${NAME}',
                },
                name: 'fooDvDisk',
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

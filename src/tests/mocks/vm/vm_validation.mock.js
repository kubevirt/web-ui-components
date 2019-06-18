export const vm1 = {
  apiVersion: 'kubevirt.io/v1alpha3',
  kind: 'VirtualMachine',
  metadata: {
    clusterName: '',
    creationTimestamp: '2018-11-06T14:32:07Z',
    generation: 1,
    name: 'vm1',
    namespace: 'test-namespace',
    resourceVersion: '10390764',
    selfLink: '/apis/kubevirt.io/v1alpha3/namespaces/default/virtualmachines/vm1',
    uid: 'bcc1d0b1-e1d0-11e8-82b4-54ee7586b9c4',
  },
  status: {
    created: true,
    ready: true,
  },
  spec: {
    dataVolumeTemplates: [
      {
        metadata: {
          name: 'dv-template',
        },
        spec: {
          source: {
            pvc: {
              name: 'fooname',
              namespace: 'foonamespace',
            },
          },
          pvc: {
            accessModes: ['ReadWriteMany'],
            resources: {
              requests: {
                storage: '1G',
              },
            },
          },
        },
      },
    ],
    running: true,
    template: {
      spec: {
        domain: {
          cpu: { cores: 2 },
          devices: {
            disks: [
              {
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
            requests: { memory: '2G' },
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
            name: 'rootdisk',
            containerDisk: { image: 'kubevirt/cirros-registry-disk-demo' },
          },
        ],
      },
    },
  },
};

export const vm2 = {
  apiVersion: 'kubevirt.io/v1alpha3',
  kind: 'VirtualMachine',
  metadata: {
    clusterName: '',
    creationTimestamp: '2018-11-06T14:32:07Z',
    generation: 1,
    name: 'vm2',
    namespace: 'test-namespace',
    resourceVersion: '10390764',
    selfLink: '/apis/kubevirt.io/v1alpha3/namespaces/default/virtualmachines/vm2',
    uid: 'bcc1d0b1-e1d0-11e8-82b4-54ee7586b9c5',
  },
  status: {
    created: true,
    ready: true,
  },
  spec: {
    dataVolumeTemplates: [
      {
        metadata: {
          name: 'dv-template',
        },
        spec: {
          source: {
            pvc: {
              name: 'fooname',
              namespace: 'foonamespace',
            },
          },
          pvc: {
            accessModes: ['ReadWriteMany'],
            resources: {
              requests: {
                storage: '1G',
              },
            },
          },
        },
      },
    ],
    running: true,
    template: {
      spec: {
        domain: {
          cpu: { cores: 2 },
          devices: {
            disks: [
              {
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
            requests: { memory: '2G' },
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
            name: 'rootdisk',
            containerDisk: { image: 'kubevirt/cirros-registry-disk-demo' },
          },
        ],
      },
    },
  },
};

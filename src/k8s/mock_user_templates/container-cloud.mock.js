export const containerCloudTemplate = {
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
    name: 'container-template-cloud-init',
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
                  {
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'cloudinitdisk',
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
                name: 'rootdisk',
                containerDisk: {
                  image: 'fooContainer',
                },
              },
              {
                cloudInitNoCloud: {
                  userData:
                    '#cloud-config\nusers:\n  - name: root\n    ssh-authorized-keys: fooSSH\nhostname: fooHostname\n',
                },
                name: 'cloudinitdisk',
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

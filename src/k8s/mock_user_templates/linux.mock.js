export const linuxUserTemplate = {
  apiVersion: 'v1',
  kind: 'Template',
  metadata: {
    name: 'linux-template',
    namespace: 'openshift',
    annotations: {
      description: 'OCP KubeVirt Red Hat Enterprise Linux 7.4 VM template',
      tags: 'kubevirt,ocp,template,linux,virtualmachine',
      iconClass: 'icon-other-linux',
    },
    labels: {
      'template.cnv.io/type': 'vm',
      'kubevirt.io/os': 'rhel7.4',
      'miq.github.io/kubevirt-is-vm-template': 'true',
      'import-vm-apb/transaction_id': 'someid',
    },
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
              name: 'vm-${NAME}-dv-01',
            },
            spec: {
              pvc: {
                storageClassName: 'storagename',
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '10Gi',
                  },
                },
              },
              source: {
                pvc: {
                  namespace: 'somenmspc',
                  name: 'somenm',
                },
              },
            },
          },
        ],
        running: false,
        template: {
          spec: {
            domain: {
              cpu: {
                // eslint-disable-next-line no-template-curly-in-string
                cores: '${{CPU_CORES}}',
              },
              resources: {
                requests: {
                  // eslint-disable-next-line no-template-curly-in-string
                  memory: '${MEMORY}',
                },
              },
              machine: {
                type: 'q35',
              },
              devices: {
                disks: [
                  {
                    name: 'disk0',
                    disk: {
                      bus: 'virtio',
                    },
                    volumeName: 'volume-1',
                  },
                ],
              },
            },
            volumes: [
              {
                name: 'volume-1',
                dataVolume: {
                  // eslint-disable-next-line no-template-curly-in-string
                  name: 'vm-${NAME}-dv-01',
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
      name: 'NAME',
      description: 'Name for the new VM',
    },
    {
      name: 'MEMORY',
      description: 'Amount of memory',
      value: '2GB',
    },
    {
      name: 'CPU_CORES',
      description: 'Amount of cores',
      value: '2',
    },
  ],
};

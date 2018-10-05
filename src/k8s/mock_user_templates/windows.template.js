export const windowsUserTemplate = {
  apiVersion: 'v1',
  kind: 'Template',
  metadata: {
    name: 'windows-template',
    namespace: 'openshift',
    annotations: {
      description: 'OCP KubeVirt Microsoft Windows Server 2016 VM template',
      tags: 'kubevirt,ocp,template,windows,virtualmachine',
      iconClass: 'icon-windows'
    },
    labels: {
      'template.cnv.io/type': 'vm',
      'kubevirt.io/os': 'win2k16',
      'miq.github.io/kubevirt-is-vm-template': 'true',
      'import-vm-apb/transaction_id': 'someid'
    }
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha2',
      kind: 'VirtualMachine',
      metadata: {
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}'
      },
      spec: {
        running: false,
        template: {
          spec: {
            domain: {
              features: {
                acpi: {},
                apic: {},
                hyperv: {
                  relaxed: {},
                  vapic: {},
                  spinlocks: {
                    spinlocks: 8191
                  }
                }
              },
              clock: {
                utc: {},
                timer: {
                  hpet: {
                    present: false
                  },
                  pit: {
                    tickPolicy: 'delay'
                  },
                  rtc: {
                    tickPolicy: 'catchup'
                  },
                  hyperv: {}
                }
              },
              cpu: {
                // eslint-disable-next-line no-template-curly-in-string
                cores: '${{CPU_CORES}}'
              },
              machine: {
                type: 'q35'
              },
              resources: {
                requests: {
                  // eslint-disable-next-line no-template-curly-in-string
                  memory: '${MEMORY}'
                }
              },
              devices: {
                disks: [
                  {
                    name: 'disk1',
                    disk: {
                      bus: 'virtio'
                    },
                    volumeName: 'volume-1'
                  }
                ]
              }
            },
            volumes: [
              {
                name: 'volume-1',
                persistentVolumeClaim: {
                  // eslint-disable-next-line no-template-curly-in-string
                  claimName: 'vm-${NAME}-disk-01'
                }
              }
            ]
          }
        }
      }
    },
    {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        // eslint-disable-next-line no-template-curly-in-string
        name: 'vm-${NAME}-disk-01',
        annotations: {
          'k8s.io/CloneRequest': 'namespace/pvc'
        }
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage: '2Gi'
          }
        }
      }
    }
  ],
  parameters: [
    {
      name: 'NAME',
      description: 'Name for the new VM'
    },
    {
      name: 'MEMORY',
      description: 'Amount of memory',
      value: '2G'
    },
    {
      name: 'CPU_CORES',
      description: 'Amount of cores',
      value: '2'
    }
  ]
};

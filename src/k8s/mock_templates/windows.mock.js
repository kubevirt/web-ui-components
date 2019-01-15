export const windows = {
  apiVersion: 'v1',
  kind: 'Template',
  metadata: {
    name: 'win2k12r2',
    namespace: 'default',
    annotations: {
      'openshift.io/display-name': 'Microsoft Windows Server 2012 R2 VM',
      description:
        'This template can be used to create a VM suitable for Microsoft Windows Server 2012 R2. The template assumes that a PVC is available which is providing the necessary Windows disk image.',
      tags: 'kubevirt,virtualmachine,windows',
      iconClass: 'icon-windows',
      'openshift.io/provider-display-name': 'KubeVirt',
      'openshift.io/documentation-url': 'https://github.com/kubevirt/common-templates',
      'openshift.io/support-url': 'https://github.com/kubevirt/common-templates/issues',
      'template.openshift.io/bindable': 'false',
      'template.cnv.io/version': 'v1alpha1',
      'defaults.template.cnv.io/disk': 'rootdisk',
      'defaults.template.cnv.io/network': 'default',
      'template.cnv.io/editable':
        '/objects[0].spec.template.spec.domain.cpu.cores\n/objects[0].spec.template.spec.domain.resources.requests.memory\n/objects[0].spec.template.spec.domain.devices.disks\n/objects[0].spec.template.spec.volumes\n/objects[0].spec.template.spec.networks\n',
      'name.os.template.cnv.io/win10': 'Microsoft Windows 10',
      'name.os.template.cnv.io/win2k8': 'Microsoft Windows Server 2008',
      'name.os.template.cnv.io/win2k8r2': 'Microsoft Windows Server 2008 R2',
      'name.os.template.cnv.io/win2k12r2': 'Microsoft Windows Server 2012 R2',
    },
    labels: {
      'os.template.cnv.io/win2k12r2': 'true',
      'os.template.cnv.io/win2k8r2': 'true',
      'os.template.cnv.io/win2k8': 'true',
      'os.template.cnv.io/win10': 'true',
      'workload.template.cnv.io/generic': 'true',
      'flavor.template.cnv.io/medium': 'true',
      'template.cnv.io/type': 'base',
    },
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha3',
      kind: 'VirtualMachine',
      metadata: {
        labels: {
          'kubevirt.io/os': 'win2k12r2',
        },
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}',
      },
      spec: {
        running: false,
        template: {
          spec: {
            domain: {
              clock: {
                utc: {},
                timer: {
                  hpet: {
                    present: false,
                  },
                  pit: {
                    tickPolicy: 'delay',
                  },
                  rtc: {
                    tickPolicy: 'catchup',
                  },
                  hyperv: {},
                },
              },
              cpu: {
                cores: 2,
              },
              resources: {
                requests: {
                  memory: '4G',
                },
              },
              features: {
                acpi: {},
                apic: {},
                hyperv: {
                  relaxed: {},
                  vapic: {},
                  spinlocks: {
                    spinlocks: 8191,
                  },
                },
              },
              devices: {
                disks: [
                  {
                    disk: {
                      bus: 'sata',
                    },
                    name: 'rootdisk',
                  },
                ],
                interfaces: [
                  {
                    bridge: {},
                    model: 'e1000e',
                    name: 'default',
                  },
                ],
              },
            },
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                name: 'rootdisk',
                persistentVolumeClaim: {
                  // eslint-disable-next-line no-template-curly-in-string
                  claimName: '${PVCNAME}',
                },
              },
            ],
            networks: [
              {
                name: 'default',
                pod: {},
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
      description: 'VM name',
      generate: 'expression',
      from: 'win2k12-[a-z0-9]{6}',
    },
    {
      name: 'PVCNAME',
      description: 'Name of the PVC with the disk image',
      required: true,
    },
  ],
};

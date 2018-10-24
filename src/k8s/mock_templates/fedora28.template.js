export const fedora28 = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    name: 'fedora-generic',
    annotations: {
      'openshift.io/display-name': 'Fedora 23+ VM',
      description:
        'This template can be used to create a VM suitable for Fedora 23 and newer. The template assumes that a PVC is available which is providing the necessary Fedora disk image. Recommended disk image (needs to be converted to raw) https://download.fedoraproject.org/pub/fedora/linux/releases/28/Cloud/x86_64/images/Fedora-Cloud-Base-28-1.1.x86_64.qcow2',
      tags: 'kubevirt,virtualmachine,fedora,rhel',
      iconClass: 'icon-fedora',
      'openshift.io/provider-display-name': 'KubeVirt',
      'openshift.io/documentation-url': 'https://github.com/fabiand/common-templates',
      'openshift.io/support-url': 'https://github.com/fabiand/common-templates/issues',
      'template.openshift.io/bindable': 'false',
      'defaults.template.cnv.io/disk': 'rootdisk'
    },
    labels: {
      'os.template.cnv.io/fedora29': 'true',
      'os.template.cnv.io/fedora28': 'true',
      'os.template.cnv.io/fedora27': 'true',
      'os.template.cnv.io/fedora26': 'true',
      'os.template.cnv.io/fedora25': 'true',
      'os.template.cnv.io/fedora24': 'true',
      'os.template.cnv.io/fedora23': 'true',
      'workload.template.cnv.io/generic': 'true',
      'flavor.template.cnv.io/small': 'true',
      'template.cnv.io/type': 'base'
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
              cpu: {
                cores: 2
              },
              resources: {
                requests: {
                  memory: '2G'
                }
              },
              devices: {
                rng: {},
                disks: [
                  {
                    disk: {
                      bus: 'virtio'
                    },
                    name: 'rootdisk',
                    volumeName: 'rootvolume'
                  },
                  {
                    disk: {
                      bus: 'virtio'
                    },
                    name: 'cloudinitdisk',
                    volumeName: 'cloudinitvolume'
                  }
                ]
              }
            },
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                name: 'rootvolume',
                persistentVolumeClaim: {
                  // eslint-disable-next-line no-template-curly-in-string
                  claimName: '${PVCNAME}'
                }
              },
              {
                cloudInitNoCloud: {
                  userData: '# configure default password\npassword: fedora\nchpasswd: { expire: False }'
                },
                name: 'cloudinitvolume'
              }
            ]
          }
        }
      }
    }
  ],
  parameters: [
    {
      description: 'VM name',
      from: '[A-Za-z0-9]{1,16}',
      generate: 'expression',
      name: 'NAME'
    },
    {
      name: 'PVCNAME',
      description: 'Name of the PVC with the disk image',
      required: true
    }
  ]
};

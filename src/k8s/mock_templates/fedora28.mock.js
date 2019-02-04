export const fedora28 = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    name: 'fedora-generic',
    namespace: 'openshift',
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
      'defaults.template.cnv.io/disk': 'rootdisk',
      'name.os.template.cnv.io/fedora29': 'Fedora 29',
      'name.os.template.cnv.io/fedora28': 'Fedora 28',
      'name.os.template.cnv.io/fedora27': 'Fedora 27',
      'name.os.template.cnv.io/fedora26': 'Fedora 26',
      'name.os.template.cnv.io/fedora25': 'Fedora 25',
      'name.os.template.cnv.io/fedora24': 'Fedora 24',
      'name.os.template.cnv.io/fedora23': 'Fedora 23',
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
      'template.cnv.io/type': 'base',
    },
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
        running: false,
        template: {
          spec: {
            domain: {
              cpu: {
                cores: 2,
              },
              resources: {
                requests: {
                  memory: '2G',
                },
              },
              devices: {
                rng: {},
                disks: [
                  {
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
              {
                cloudInitNoCloud: {
                  userData: '# configure default password\npassword: fedora\nchpasswd: { expire: False }',
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
      description: 'VM name',
      from: '[A-Za-z0-9]{1,16}',
      generate: 'expression',
      name: 'NAME',
    },
    {
      name: 'PVCNAME',
      description: 'Name of the PVC with the disk image',
      required: true,
    },
  ],
};

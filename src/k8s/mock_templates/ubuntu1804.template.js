export const ubuntu1804 = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    name: 'ubuntu1804',
    namespace: 'default',
    annotations: {
      'openshift.io/display-name': 'Ubuntu 18.04 (Xenial Xerus) VM',
      description:
        'This template can be used to create a VM suitable for Ubuntu 18.04 (Xenial Xerus). The template assumes that a PVC is available which is providing the necessary Ubuntu disk image. Recommended disk image (needs to be converted to raw) http://cloud-images.ubuntu.com/xenial/current/xenial-server-cloudimg-amd64-disk1.img',
      tags: 'kubevirt,virtualmachine,ubuntu',
      iconClass: 'icon-ubuntu',
      'openshift.io/provider-display-name': 'KubeVirt',
      'openshift.io/documentation-url': 'https://github.com/fabiand/common-templates',
      'openshift.io/support-url': 'https://github.com/fabiand/common-templates/issues',
      'template.openshift.io/bindable': 'false',
      'defaults.template.cnv.io/disk': 'rootdisk',
    },
    labels: {
      'os.template.cnv.io/ubuntu18.04': 'true',
      'workload.template.cnv.io/generic': 'true',
      'flavor.template.cnv.io/small': 'true',
      'template.cnv.io/type': 'base',
    },
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha2',
      kind: 'VirtualMachineInstancePreset',
      metadata: {
        name: 'ubuntu1804',
      },
      spec: {
        selector: {
          matchLabels: {
            'kubevirt.io/os': 'ubuntu1804',
          },
        },
      },
    },
    {
      apiVersion: 'kubevirt.io/v1alpha2',
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
                model: 'Conroe',
              },
              devices: {
                disks: [
                  {
                    disk: {
                      bus: 'virtio',
                    },
                    name: 'rootdisk',
                    volumeName: 'rootvolume',
                  },
                ],
              },
              resources: {
                requests: {
                  memory: '2G',
                },
              },
            },
            terminationGracePeriodSeconds: 0,
            volumes: [
              {
                name: 'rootvolume',
                persistentVolumeClaim: {
                  // eslint-disable-next-line no-template-curly-in-string
                  claimName: '${PVCNAME}',
                },
              },
              {
                cloudInitNoCloud: {
                  userData: '#cloud-config\npassword: ubuntu\nchpasswd: { expire: False }',
                },
                name: 'cloudinitvolume',
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
      description: 'Name of the new VM',
      generate: 'expression',
      from: 'ubuntu1804-[a-z0-9]{6}',
      required: true,
    },
    {
      name: 'PVCNAME',
      description: 'Name of the PVC with the disk image',
      required: true,
    },
  ],
};

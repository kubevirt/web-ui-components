export const cloudInitTestVm = {
  apiVersion: 'kubevirt.io/v1alpha3',
  kind: 'VirtualMachine',
  metadata: {
    annotations: {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lacus nibh, convallis vel nunc id,' +
        'tempus vulputate augue. Proin eget nisl vel ante tincidunt accumsan vel at elit. Fusce eget tincidunt sem. ' +
        'Fusce cursus orci vitae nisl hendrerit mollis. Nullam at nulla ut ipsum malesuada laoreet a sit amet est.',
    },
    labels: {
      'flavor.template.cnv.io/small': 'true',
      'os.template.cnv.io/fedora29': 'true',
      'template.cnv.ui': 'default_fedora-generic',
      'workload.template.cnv.io/generic': 'true',
    },
    clusterName: '',
    creationTimestamp: '2018-11-06T14:32:07Z',
    generation: 1,
    name: 'cloudinit-test-vm',
    namespace: 'default',
    resourceVersion: '10390764',
    selfLink: '/apis/kubevirt.io/v1alpha3/namespaces/default/virtualmachines/cloudinit-test-vm',
    uid: 'bcc1d0b1-e1d0-11e8-82b4-54ee7586b9c3',
  },
  status: {
    created: true,
    ready: false,
  },
  spec: {
    running: false,
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
          {
            name: 'cloudinitdisk',
            cloudInitNoCloud: {
              userData:
                '#cloud-config\n' +
                'users:\n' +
                '  - name: root\n' +
                '    ssh-authorized-keys: |-\n' +
                '      AAAAB3NzaC1yc2EAAAABIwAAAQEAklOUpkDHrfHY17SbrmTIpNLTGK9Tjom/BWDSU\n' +
                '      GPl+nafzlHDTYW7hdI4yZ5ew18JH4JW9jbhUFrviQzM7xlELEVf4h9lFX5QVkbPppSwg0cda3\n' +
                '      Pbv7kOdJ/MTyBlWXFCR+HAo3FXRitBqxiX1nKhXpHAZsMciLq8V6RjsNAQwdsdMFvSlVK/7XA\n' +
                '      t3FaoJoAsncM1Q9x5+3V0Ww68/eIFmb1zuUFljQJKprrX88XypNDvjYNby6vw/Pb0rwert/En\n' +
                '      mZ+AW4OZPnTPI89ZPmVMLuayrD2cE86Z/il8b+gw3r3+1nKatmIkjn2so1d01QraTlMqVSsbx\n' +
                '      NrRFi9wrf+M7Q==\n' +
                'hostname: cloudinit-test\n',
            },
          },
        ],
      },
    },
  },
};

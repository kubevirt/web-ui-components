export const cloudInitTestVmi = {
  apiVersion: 'kubevirt.io/v1alpha3',
  kind: 'VirtualMachineInstance',
  metadata: {
    annotations: { 'presets.virtualmachines.kubevirt.io/presets-applied': 'kubevirt.io/v1alpha3' },
    clusterName: '',
    creationTimestamp: '2018-11-12T20:49:28Z',
    finalizers: ['foregroundDeleteVirtualMachine'],
    generateName: 'cloudinit-test-vm',
    generation: 1,
    name: 'cloudinit-test-vmi',
    namespace: 'myproject',
    ownerReferences: [
      {
        apiVersion: 'kubevirt.io/v1alpha3',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'VirtualMachine',
        name: 'cloudinit-test-vm',
        uid: 'bcc1d0b1-e1d0-11e8-82b4-54ee7586b9c3',
      },
    ],
    resourceVersion: '11772039',
    selfLink: '/apis/kubevirt.io/v1alpha3/namespaces/myproject/virtualmachineinstances/cloudinit-test-vmi',
    uid: '725c602a-e6bc-11e8-94d4-54ee7586b9c3',
  },
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
            bridge: { name: 'eth0' },
          },
        ],
        rng: {},
      },
      features: {
        acpi: { enabled: true },
      },
      firmware: {
        uuid: '4684e2dd-e664-57bd-ac9e-cb19c7dcc280',
      },
      machine: {
        type: 'q35',
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
        registryDisk: { image: 'kubevirt/cirros-registry-disk-demo' },
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
  status: {
    interfaces: [
      { ipAddress: '172.17.0.15', mac: '02:42:ac:11:00:0d', name: 'default' },
      { ipAddress: '172.17.0.16', mac: '02:42:ac:11:00:0e', name: 'backup1' },
      { ipAddress: '172.17.0.17', mac: '02:42:ac:11:00:0f', name: 'backup2' },
    ],
    nodeName: 'localhost',
    phase: 'Running',
  },
};

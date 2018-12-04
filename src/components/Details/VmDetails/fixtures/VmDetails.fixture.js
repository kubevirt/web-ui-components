import { VmDetails } from '../VmDetails';
import { PodModel } from '../../../../models';

const vm = {
  apiVersion: 'kubevirt.io/v1alpha2',
  kind: 'VirtualMachine',
  metadata: {
    annotations: {
      'flavor.template.cnv.io': 'small',
      'os.template.cnv.io': 'fedora29',
      'template.cnv.ui': 'default/fedora-generic',
      'workload.template.cnv.io': 'generic',
    },
    clusterName: '',
    creationTimestamp: '2018-11-06T14:32:07Z',
    generation: 1,
    name: 'test-vm',
    namespace: 'default',
    resourceVersion: '10390764',
    selfLink: '/apis/kubevirt.io/v1alpha2/namespaces/default/virtualmachines/test-vm',
    uid: 'bcc1d0b1-e1d0-11e8-82b4-54ee7586b9c3',
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
                volumeName: 'rootvolume',
              },
              {
                disk: {
                  bus: 'virtio',
                },
                name: 'cloudinitdisk',
                volumeName: 'cloudinitvolume',
              },
            ],
            interfaces: [
              {
                bridge: { name: 'eth0' },
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
            name: 'rootvolume',
            registryDisk: { image: 'kubevirt/cirros-registry-disk-demo' },
          },
          {
            name: 'cloudinitvolume',
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

const vmi = {
  apiVersion: 'kubevirt.io/v1alpha2',
  kind: 'VirtualMachineInstance',
  metadata: {
    annotations: { 'presets.virtualmachines.kubevirt.io/presets-applied': 'kubevirt.io/v1alpha2' },
    clusterName: '',
    creationTimestamp: '2018-11-12T20:49:28Z',
    finalizers: ['foregroundDeleteVirtualMachine'],
    generateName: 'cloudinit-test-vm',
    generation: 1,
    name: 'cloudinit-test-vm',
    namespace: 'myproject',
    ownerReferences: [
      {
        apiVersion: 'kubevirt.io/v1alpha2',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'VirtualMachine',
        name: 'cloudinit-test-vm',
        uid: 'bcc1d0b1-e1d0-11e8-82b4-54ee7586b9c3',
      },
    ],
    resourceVersion: '11772039',
    selfLink: '/apis/kubevirt.io/v1alpha2/namespaces/myproject/virtualmachineinstances/cloudinit-test-vm',
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
            volumeName: 'rootvolume',
          },
          {
            disk: {
              bus: 'virtio',
            },
            name: 'cloudinitdisk',
            volumeName: 'cloudinitvolume',
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
        name: 'rootvolume',
        registryDisk: { image: 'kubevirt/cirros-registry-disk-demo' },
      },
      {
        name: 'cloudinitvolume',
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
    conditions: [
      {
        lastProbeTime: null,
        lastTransitionTime: '2018-11-12T20:49:28Z',
        message:
          "0/1 nodes are available: 1 Insufficient devices.kubevirt.io/kvm, 1 Insufficient devices.kubevirt.io/tun, 1 node(s) didn't match node selector.",
        reason: 'Unschedulable',
        status: 'False',
        type: 'PodScheduled',
      },
    ],
    phase: 'Scheduling',
  },
};

const pod = {
  metadata: {
    name: 'virt-launcher-cloudinit-test-vm-tnqrz',
  },
  status: {
    phase: 'Running',
  },
};

export default {
  component: VmDetails,
  props: {
    vm,
    vms: [vm],
    vmi,
    vmis: [vmi],
    pod,
    pods: [pod],
    PodModel,
  },
};

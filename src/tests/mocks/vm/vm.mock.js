import { dataVolumes } from '../dataVolume';
import { getName } from '../../../selectors';
import { persistentVolumeClaims } from '../persistentVolumeClaim';
import { LABEL_USED_TEMPLATE_NAME, LABEL_USED_TEMPLATE_NAMESPACE } from '../../../constants';

export const fullVm = {
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
      'flavor.template.kubevirt.io/small': 'true',
      'os.template.kubevirt.io/fedora29': 'true',
      [LABEL_USED_TEMPLATE_NAME]: 'fedora-generic',
      [LABEL_USED_TEMPLATE_NAMESPACE]: 'default',
      'workload.template.kubevirt.io/generic': 'true',
    },
    clusterName: '',
    creationTimestamp: '2018-11-06T14:32:07Z',
    generation: 1,
    name: 'full-vm',
    namespace: 'default',
    resourceVersion: '10390764',
    selfLink: '/apis/kubevirt.io/v1alpha3/namespaces/default/virtualmachines/cloudinit-test-vm',
    uid: 'bcc1d0b1-e1d0-11e8-82b4-54ee7586b9c3',
  },
  status: {
    created: true,
    ready: true,
  },
  spec: {
    dataVolumeTemplates: [
      {
        metadata: {
          name: 'dv-template',
        },
        spec: {
          source: {
            pvc: {
              name: 'fooname',
              namespace: 'foonamespace',
            },
          },
          pvc: {
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: '1G',
              },
            },
          },
        },
      },
    ],
    running: true,
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
              {
                disk: {
                  bus: 'virtio',
                },
                name: 'datavolumedisk',
              },
              {
                disk: {
                  bus: 'virtio',
                },
                name: 'datavolumetemplatedisk',
              },
              {
                disk: {
                  bus: 'virtio',
                },
                name: 'pvcdisk',
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
            name: 'datavolumedisk',
            dataVolume: { name: getName(dataVolumes.url) },
          },
          {
            name: 'datavolumetemplatedisk',
            dataVolume: { name: 'dv-template' },
          },
          {
            name: 'pvcdisk',
            persistentVolumeClaim: { claimName: getName(persistentVolumeClaims[0]) },
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

export const blueVmi = {
  apiVersion: 'kubevirt.io/v1alpha2',
  kind: 'VirtualMachineInstance',
  metadata: {
    name: 'blue',
    namespace: 'default',
    selfLink: '/apis/kubevirt.io/v1alpha2/namespaces/default/virtualmachineinstances/blue',
    uid: '6a726836-e352-11e8-a6a5-8c16455167e9',
    labels: {},
  },
  spec: {
    domain: {
      devices: {},
      machine: {
        type: '',
      },
      resource: {
        requests: {
          memory: '8Mi',
        },
      },
    },
  },
  status: {
    phase: 'Running',
  },
};

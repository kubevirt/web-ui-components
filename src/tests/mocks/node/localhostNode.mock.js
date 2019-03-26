export const localhostNode = {
  apiVersion: 'v1',
  kind: 'Node',
  metadata: {
    annotations: {
      'kubevirt.io/heartbeat': '2019-03-18T16:49:58Z',
      'volumes.kubernetes.io/controller-managed-attach-detach': 'true',
    },
    creationTimestamp: '2019-02-18T14:44:15Z',
    labels: {
      'beta.kubernetes.io/arch': 'amd64',
      'beta.kubernetes.io/os': 'linux',
      'kubernetes.io/hostname': 'localhost',
      'kubevirt.io/schedulable': 'true',
    },
    name: 'localhost',
    namespace: '',
    resourceVersion: '824726',
    selfLink: '/api/v1/nodes/localhost',
    uid: 'cbe7be36-5026-4295-b2cc-6111f77b07d5',
  },

  spec: {},
  status: {
    addresses: [
      {
        address: '192.168.0.25',
        type: 'InternalIP',
      },
      {
        address: 'localhost',
        type: 'Hostname',
      },
    ],
    allocatable: {
      cpu: '8',
      'devices.kubevirt.io/kvm': '110',
      'devices.kubevirt.io/tun': '110',
      'devices.kubevirt.io/vhost-net': '110',
      'hugepages-1Gi': '0',
      'hugepages-2Mi': '0',
      memory: '32197356Ki',
      pods: '250',
    },
    capacity: {
      cpu: '8',
      'devices.kubevirt.io/kvm': '110',
      'devices.kubevirt.io/tun': '110',
      'devices.kubevirt.io/vhost-net': '110',
      'hugepages-1Gi': '0',
      'hugepages-2Mi': '0',
      memory: '32299756Ki',
      pods: '250',
    },
    conditions: [
      {
        lastHeartbeatTime: '2019-03-18T16:50:08Z',
        lastTransitionTime: '2019-02-18T14:44:10Z',
        message: 'kubelet has sufficient disk space available',
        reason: 'KubeletHasSufficientDisk',
        status: 'False',
        type: 'OutOfDisk',
      },
      {
        lastHeartbeatTime: '2019-03-18T16:50:08Z',
        lastTransitionTime: '2019-02-18T14:44:10Z',
        message: 'kubelet has sufficient memory available',
        reason: 'KubeletHasSufficientMemory',
        status: 'False',
        type: 'MemoryPressure',
      },
      {
        lastHeartbeatTime: '2019-03-18T16:50:08Z',
        lastTransitionTime: '2019-02-18T14:44:10Z',
        message: 'kubelet has no disk pressure',
        reason: 'KubeletHasNoDiskPressure',
        status: 'False',
        type: 'DiskPressure',
      },
      {
        lastHeartbeatTime: '2019-03-18T16:50:08Z',
        lastTransitionTime: '2019-02-18T14:44:10Z',
        message: 'kubelet has sufficient PID available',
        reason: 'KubeletHasSufficientPID',
        status: 'False',
        type: 'PIDPressure',
      },
      {
        lastHeartbeatTime: '2019-03-18T16:50:08Z',
        lastTransitionTime: '2019-02-18T14:44:10Z',
        message: 'kubelet is posting ready status',
        reason: 'KubeletReady',
        status: 'True',
        type: 'Ready',
      },
    ],
    daemonEndpoints: {
      kubeletEndpoint: {
        Port: 10250,
      },
    },
    images: [
      {
        names: [
          'openshift/origin-node@sha256:952faf477f2819c19580d37e871eb36b2cd4fa8be2e7f3a0eebfa4021b220a1e',
          'openshift/origin-node:v3.11',
        ],
        sizeBytes: 1157249282,
      },
      {
        names: [
          'openshift/origin-control-plane@sha256:bf28e6729781f2d68c9ea121cee5c649a084ae9a4dadefded9321e2e381a2549',
          'openshift/origin-control-plane:v3.11',
        ],
        sizeBytes: 826232564,
      },
      {
        names: [
          'openshift/origin-deployer@sha256:dcd00fdc779c2b0afb33beb9cbc0a329a5baf51c6b9ea639453e7dcd0a99a011',
          'openshift/origin-deployer:v3.10',
        ],
        sizeBytes: 820312425,
      },
    ],
    nodeInfo: {
      architecture: 'amd64',
      bootID: 'a10ef8ac-a1f6-425a-9a98-97d71bda0ba3',
      containerRuntimeVersion: 'docker://18.3.0',
      kernelVersion: '4.20.8-arch1-1-ARCH',
      kubeProxyVersion: 'v1.11.0+d4cacc0',
      kubeletVersion: 'v1.11.0+d4cacc0',
      machineID: '',
      operatingSystem: 'linux',
      osImage: 'CentOS Linux 7 (Core)',
      systemUUID: 'bb754413-b7ef-4628-87f1-d1746ecb3f9e',
    },
  },
};

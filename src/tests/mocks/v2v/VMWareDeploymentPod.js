export const vmWareDeploymentFailedPod = {
  kind: 'Pod',
  apiVersion: 'v1',
  metadata: {
    generateName: 'v2v-vmware-676769c6c8-',
    selfLink: '/api/v1/namespaces/kube-public/pods/v2v-vmware-676769c6c8-rr4q9',
    resourceVersion: '222166',
    name: 'v2v-vmware-676769c6c8-rr4q9',
    uid: 'c49d67d7-8151-11e9-aaab-8c16455167e9',
    namespace: 'kube-public',
    ownerReferences: [
      {
        apiVersion: 'apps/v1',
        kind: 'ReplicaSet',
        name: 'v2v-vmware-676769c6c8',
        uid: 'c49cd818-8151-11e9-aaab-8c16455167e9',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
    labels: {
      name: 'v2v-vmware',
      'pod-template-hash': '2323257274',
    },
  },
  spec: {
    restartPolicy: 'Always',
    serviceAccountName: 'v2v-vmware',
    imagePullSecrets: [
      {
        name: 'v2v-vmware-dockercfg-9btj2',
      },
    ],
    priority: 0,
    schedulerName: 'default-scheduler',
    terminationGracePeriodSeconds: 30,
    nodeName: 'localhost',
    securityContext: {},
    containers: [
      {
        resources: {},
        terminationMessagePath: '/dev/termination-log',
        name: 'v2v-vmware',
        command: ['kubevirt-vmware'],
        env: [
          {
            name: 'WATCH_NAMESPACE',
            valueFrom: {
              fieldRef: {
                apiVersion: 'v1',
                fieldPath: 'metadata.namespace',
              },
            },
          },
          {
            name: 'POD_NAME',
            valueFrom: {
              fieldRef: {
                apiVersion: 'v1',
                fieldPath: 'metadata.name',
              },
            },
          },
          {
            name: 'OPERATOR_NAME',
            value: 'v2v-vmware',
          },
        ],
        imagePullPolicy: 'IfNotPresent',
        volumeMounts: [
          {
            name: 'v2v-vmware-token-smptg',
            readOnly: true,
            mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
          },
        ],
        terminationMessagePolicy: 'File',
        image: 'quay.io/kubevirt/kubevirt-vmware:latests',
      },
    ],
    serviceAccount: 'v2v-vmware',
    volumes: [
      {
        name: 'v2v-vmware-token-smptg',
        secret: {
          secretName: 'v2v-vmware-token-smptg',
          defaultMode: 420,
        },
      },
    ],
    dnsPolicy: 'ClusterFirst',
  },
  status: {
    phase: 'Pending',
    conditions: [
      {
        type: 'Initialized',
        status: 'True',
        lastProbeTime: null,
      },
      {
        type: 'Ready',
        status: 'False',
        lastProbeTime: null,
        reason: 'ContainersNotReady',
        message: 'containers with unready status: [v2v-vmware]',
      },
      {
        type: 'ContainersReady',
        status: 'False',
        lastProbeTime: null,
        lastTransitionTime: null,
        reason: 'ContainersNotReady',
        message: 'containers with unready status: [v2v-vmware]',
      },
      {
        type: 'PodScheduled',
        status: 'True',
        lastProbeTime: null,
      },
    ],
    hostIP: '192.168.1.18',
    podIP: '172.17.0.11',
    containerStatuses: [
      {
        name: 'v2v-vmware',
        state: {
          waiting: {
            reason: 'ImagePullBackOff',
            message: 'Back-off pulling image "quay.io/kubevirt/kubevirt-vmware:latests"',
          },
        },
        lastState: {},
        ready: false,
        restartCount: 0,
        image: 'quay.io/kubevirt/kubevirt-vmware:latest',
        imageID: '',
      },
    ],
    qosClass: 'BestEffort',
  },
};

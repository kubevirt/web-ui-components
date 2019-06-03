export const vmWareDeployment = {
  kind: 'Deployment',
  apiVersion: 'apps/v1',
  metadata: {
    name: 'v2v-vmware',
    namespace: 'kube-public',
    selfLink: '/apis/apps/v1/namespaces/kube-public/deployments/v2v-vmware',
    uid: '5ec394d6-814e-11e9-aaab-8c16455167e9',
    resourceVersion: '217420',
    generation: 1,
    annotations: {
      'deployment.kubernetes.io/revision': '1',
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        name: 'v2v-vmware',
      },
    },
    template: {
      metadata: {
        creationTimestamp: null,
        labels: {
          name: 'v2v-vmware',
        },
      },
      spec: {
        containers: [
          {
            name: 'v2v-vmware',
            image: 'quay.io/kubevirt/kubevirt-vmware:latest',
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
            resources: {},
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'IfNotPresent',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'v2v-vmware',
        serviceAccount: 'v2v-vmware',
        securityContext: {},
        schedulerName: 'default-scheduler',
      },
    },
    strategy: {
      type: 'RollingUpdate',
      rollingUpdate: {
        maxUnavailable: '25%',
        maxSurge: '25%',
      },
    },
    revisionHistoryLimit: 10,
    progressDeadlineSeconds: 600,
  },
  status: {
    observedGeneration: 1,
    replicas: 1,
    updatedReplicas: 1,
    readyReplicas: 1,
    availableReplicas: 1,
    conditions: [
      {
        type: 'Available',
        status: 'True',
        reason: 'MinimumReplicasAvailable',
        message: 'Deployment has minimum availability.',
      },
      {
        type: 'Progressing',
        status: 'True',
        reason: 'NewReplicaSetAvailable',
        message: 'ReplicaSet "v2v-vmware-67b488b7" has successfully progressed.',
      },
    ],
  },
};

export const vmWareDeploymentProgressing = {
  ...vmWareDeployment,
  status: {
    ...vmWareDeployment.status,
    readyReplicas: 0,
    availableReplicas: 0,
    unavailableReplicas: 1,
    conditions: [
      {
        type: 'Available',
        status: 'False',
        reason: 'MinimumReplicasUnavailable',
        message: 'Deployment does not have minimum availability.',
      },
      {
        type: 'Progressing',
        status: 'True',
        reason: 'ReplicaSetUpdated',
        message: 'ReplicaSet "v2v-vmware-67b488b7" is progressing..',
      },
    ],
  },
};

export const vmWareDeploymentFailed = {
  ...vmWareDeployment,
  status: {
    ...vmWareDeployment.status,
    readyReplicas: 0,
    availableReplicas: 0,
    unavailableReplicas: 1,
    conditions: [
      {
        type: 'Available',
        status: 'False',
        reason: 'MinimumReplicasUnavailable',
        message: 'Deployment does not have minimum availability.',
      },
      {
        type: 'Progressing',
        status: 'False',
        reason: 'ProgressDeadlineExceeded',
        message: 'ReplicaSet "v2v-vmware-676769c6c8" has timed out progressing.',
      },
    ],
  },
};

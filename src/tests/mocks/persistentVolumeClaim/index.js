export const persistentVolumeClaims = [
  {
    metadata: {
      // should be the same namespaces as the vm
      name: 'disk-one',
      namespace: 'default',
    },
    spec: {
      resources: {
        requests: {
          storage: '10gi',
        },
      },
      storageClassName: 'nfs',
    },
  },
  {
    metadata: {
      name: 'disk-two',
      namespace: 'myproject',
    },
    spec: {
      resources: {
        requests: {
          storage: '15gi',
        },
      },
      storageClassName: 'glusterfs',
    },
  },
  {
    metadata: {
      name: 'disk-three',
      namespace: 'default',
    },
    spec: {
      resources: {
        requests: {
          storage: '20gi',
        },
      },
      storageClassName: 'iscsi',
    },
  },
  {
    metadata: {
      name: 'datavolume-url-success',
      namespace: 'default',
    },
    spec: {
      resources: {
        requests: {
          storage: '20gi',
        },
      },
      storageClassName: 'iscsi',
    },
  },
  {
    metadata: {
      name: 'datavolume-blank',
      namespace: 'default',
    },
    spec: {
      resources: {
        requests: {
          storage: '20gi',
        },
      },
      storageClassName: 'iscsi',
    },
  },
];

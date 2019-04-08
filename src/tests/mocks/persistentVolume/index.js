export const persistentVolumes = [
  {
    metadata: {
      name: 'disk-one_pv',
    },
    spec: {
      capacity: {
        storage: '10gi',
      },
      storageClassName: 'nfs',
    },
  },
  {
    metadata: {
      name: 'disk-two_pv',
    },
    spec: {
      capacity: {
        storage: '15gi',
      },
      storageClassName: 'glusterfs',
    },
  },
  {
    metadata: {
      name: 'disk-three_pv',
    },
    spec: {
      capacity: {
        storage: '20gi',
      },
      storageClassName: 'iscsi',
    },
  },
  {
    metadata: {
      name: 'datavolume-url-success_pv',
    },
    spec: {
      capacity: {
        storage: '20gi',
      },
      storageClassName: 'iscsi',
    },
  },
  {
    metadata: {
      name: 'datavolume-blank_pv',
    },
    spec: {
      capacity: {
        storage: '20gi',
      },
      storageClassName: 'iscsi',
    },
  },
];

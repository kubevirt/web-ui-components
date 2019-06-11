import { DataVolumeModel } from '../../../models';

export const dataVolumes = {
  url: {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      name: 'datavolume-url',
      namespace: 'default',
    },
    spec: {
      source: {
        http: {
          url: 'https://download.cirros-cloud.net/0.4.0/cirros-0.4.0-x86_64-disk.img',
        },
      },
      pvc: {
        accessModes: ['ReadWriteMany'],
        resources: {
          requests: {
            storage: '1G',
          },
        },
      },
    },
  },
  urlSuccess: {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      name: 'datavolume-url-success',
      namespace: 'default',
    },
    spec: {
      source: {
        http: {
          url: 'https://download.cirros-cloud.net/0.4.0/cirros-0.4.0-x86_64-disk.img',
        },
      },
      pvc: {
        accessModes: ['ReadWriteMany'],
        resources: {
          requests: {
            storage: '1G',
          },
        },
      },
    },
    status: {
      phase: 'Succeeded',
    },
  },
  blank: {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      name: 'datavolume-blank',
      namespace: 'default',
    },
    spec: {
      source: {
        blank: {},
      },
      pvc: {
        accessModes: ['ReadWriteMany'],
        resources: {
          requests: {
            storage: '1G',
          },
        },
      },
    },
  },
  pvc: {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      name: 'datavolume-pvc',
      namespace: 'default',
    },
    spec: {
      source: {
        pvc: {
          name: 'pvc-source',
          namespace: 'pvc-namespace',
        },
      },
      pvc: {
        accessModes: ['ReadWriteMany'],
        resources: {
          requests: {
            storage: '1G',
          },
        },
      },
    },
  },
  pvcSuccess: {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      name: 'datavolume-pvc-success',
      namespace: 'default',
    },
    spec: {
      source: {
        pvc: {
          name: 'pvc-source',
          namespace: 'pvc-namespace',
        },
      },
      pvc: {
        accessModes: ['ReadWriteMany'],
        resources: {
          requests: {
            storage: '1G',
          },
        },
      },
    },
    status: {
      phase: 'Succeeded',
    },
  },
};

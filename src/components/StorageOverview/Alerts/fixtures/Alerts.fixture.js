import { Alerts } from '../Alerts';

export const cephDiskInaccessibleAlert = {
  annotations: {
    description: 'Disk inaccessible on host ip-10-0-154-62.ec2.internal (device xvda)',
    message: 'Disk is inaccessible',
    storage_type: 'ceph',
  },
  labels: {
    alertname: 'CephOSDDiskUnavailable',
    severity: 'critical',
  },
};

export const cephDataRecoveryAlert = {
  annotations: {
    description: 'Data recovery has been active for over 2h. Contact Support',
    message: 'Data recovery is slow',
    storage_type: 'ceph',
  },
  labels: {
    alertname: 'CephDataRecoveryTakingTooLong',
    severity: 'warning',
  },
};

export default [
  {
    component: Alerts,
    name: 'Alerts',
    props: {
      alertsResponse: [cephDiskInaccessibleAlert, cephDataRecoveryAlert],
    },
  },
  {
    component: Alerts,
    name: 'Disk Inaccessible',
    props: {
      alertsResponse: [cephDiskInaccessibleAlert],
    },
  },
  {
    component: Alerts,
    name: 'Data Recovery',
    props: {
      alertsResponse: [cephDataRecoveryAlert],
    },
  },
  {
    component: Alerts,
    name: 'Empty Alerts',
    props: {
      alertsResponse: [],
    },
  },
];

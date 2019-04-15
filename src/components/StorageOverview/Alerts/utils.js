import { getStorageType } from '../../../selectors/prometheus/alerts';

export const filterAlerts = alerts => alerts.filter(alert => getStorageType(alert) === 'ceph');

import { get } from 'lodash';

export const getAlertSeverity = alert => get(alert, 'labels.severity');
export const getAlertMessage = alert => get(alert, 'annotations.message');
export const getAlertDescription = alert => get(alert, 'annotations.description');
export const getStorageType = alert => get(alert, 'annotations.storage_type');

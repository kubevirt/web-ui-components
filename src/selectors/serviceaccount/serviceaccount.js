import { get } from 'lodash';

export const getServiceAccountSecrets = serviceAccount => get(serviceAccount, 'secrets', []);

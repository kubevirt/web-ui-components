import { get } from 'lodash';

export const getServiceSelectors = service => get(service, 'spec.selector', {});

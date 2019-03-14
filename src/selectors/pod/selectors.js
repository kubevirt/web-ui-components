import { get } from 'lodash';

export const getNodeName = pod => get(pod, 'spec.nodeName');
export const getHostName = pod => get(pod, 'spec.hostname');

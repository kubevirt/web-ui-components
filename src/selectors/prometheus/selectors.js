import { get } from 'lodash';

import { parseNumber } from '../../utils';

export const getConsumers = (results, nameLabel, formatLabel) => {
  const result = get(results, 'data.result');
  if (!result) {
    return null;
  }
  return result.map(r => ({
    name: r.metric[nameLabel],
    usage: r.value[1],
    label: formatLabel ? formatLabel(r.value[1]) : r.value[1],
  }));
};

export const getCapacityStats = response => {
  const value = get(response, 'data.result[0].value[1]');
  return parseNumber(value);
};

export const getUtilizationCpuStats = response => {
  const values = get(response, 'data.result[0].values');
  return values && Array.isArray(values) ? values.map(timeValuePair => parseNumber(timeValuePair[1])) : null;
};

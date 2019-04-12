import { flatMap, max } from 'lodash';

import { parseNumber, formatBytes } from '../../utils';

export const getTopConsumerVectorStats = result => {
  let maxVal = 0;

  const namespaceValues = flatMap(result, namespace => namespace.values);
  const allBytes = flatMap(namespaceValues, value => parseNumber(value[1]));

  maxVal = max(allBytes);

  const maxCapacityConverted = { ...formatBytes(maxVal) };

  const yAxisData = result.map(r => [
    r.metric.namespace,
    ...r.values.map(array => formatBytes(array[1], maxCapacityConverted.unit, 2).value),
  ]);

  let largestLengthArray = 0;
  let largestLengthArrayIndex = 0;

  // timestamps count and values are not same for all the namespaces. Hence, finding the largest length array and taking its timestamps value as x-axis point
  result.forEach((namespace, index) => {
    const len = namespace.values.length;
    if (len > largestLengthArray) {
      largestLengthArray = len;
      largestLengthArrayIndex = index;
    }
  });
  const xAxisData = ['x', ...result[largestLengthArrayIndex].values.map(array => new Date(array[0] * 1000))];

  const stats = {
    columns: [xAxisData, ...yAxisData],
    unit: maxCapacityConverted.unit,
  };

  return stats;
};

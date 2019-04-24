import { flatMap, max } from 'lodash';

import { parseNumber, formatBytes } from '../../utils';

export const getTopConsumerVectorStats = result => {
  let maxVal = 0;

  const namespaceValues = flatMap(result, namespace => namespace.values);
  const allBytes = flatMap(namespaceValues, value => parseNumber(value[1]));
  maxVal = max(allBytes);
  const maxCapacityConverted = { ...formatBytes(maxVal) };

  const sortNamespaces = (a, b) => {
    let isALarger = 0;
    a = a.metric.namespace.toLowerCase();
    b = b.metric.namespace.toLowerCase();
    if (a > b) {
      isALarger = 1;
    } else if (a < b) {
      isALarger = -1;
    }

    return isALarger;
  };
  const sortedResult = result.sort(sortNamespaces);

  const legends = sortedResult.map(r => ({ name: r.metric.namespace }));

  const chartData = sortedResult.map(r =>
    r.values.map(arr => [new Date(arr[0] * 1000), formatBytes(arr[1], maxCapacityConverted.unit, 2).value])
  );

  // sorting namespaces to maintain the order of legends displayed for chart
  const stats = {
    chartData,
    legends,
    maxCapacity: Number(maxCapacityConverted.value),
    unit: maxCapacityConverted.unit,
  };

  return stats;
};

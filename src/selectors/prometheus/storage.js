import { flatMap, max } from 'lodash';

import { parseNumber, formatBytes } from '../../utils';
import { PROJECTS, STORAGE_CLASSES, PODS } from '../../components/StorageOverview/TopConsumers/strings';

export const getTopConsumerVectorStats = (result, metricType) => {
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

  const chartData = sortedResult.map(r =>
    r.values.map(arr => [new Date(arr[0] * 1000), formatBytes(arr[1], maxCapacityConverted.unit, 2).value])
  );

  // sorting namespaces to maintain the order of legends displayed for chart
  const stats = {
    chartData,
    legends: getLegends(sortedResult, metricType),
    maxCapacity: Number(maxCapacityConverted.value.toFixed(1)),
    unit: maxCapacityConverted.unit,
  };

  return stats;
};

export const getLegends = (data, metricType) => {
  switch (metricType) {
    case PROJECTS:
      return data.map(r => ({ name: r.metric.namespace }));
    case STORAGE_CLASSES:
      return data.map(r => ({ name: r.metric.storageclass }));
    case PODS:
      return data.map(r => ({ name: r.metric.pod }));
    default:
      return [];
  }
};

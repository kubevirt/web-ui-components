import { formatBytes } from '../../../utils';
import { getConsumers } from '../../../selectors';

export const formatCpu = (cpuTime, fixed = 0) => Number(cpuTime).toFixed(fixed);

export const formatBytesWithUnits = bytes => {
  const formattedBytes = formatBytes(bytes);
  return `${formattedBytes.value} ${formattedBytes.unit}`;
};

export const getMetric = (results, metricName, format) => ({
  isLoading: !results,
  consumers: getConsumers(results, metricName, format),
});

export const getMetricConsumers = ({ consumers }) => {
  const max = Math.max(...consumers.map(c => c.usage));
  return consumers
    .map(c => ({
      now: Math.round((100 * c.usage) / max),
      description: c.name,
      label: c.label,
    }))
    .sort((a, b) => b.now - a.now);
};

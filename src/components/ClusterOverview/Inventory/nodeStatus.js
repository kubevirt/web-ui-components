import { get } from 'lodash';

export const getNodeErrorStatuses = node => {
  const conditions = get(node, 'status.conditions');
  const errors = conditions
    .filter(c => c.type !== 'Ready')
    .filter(c => c.status === 'True')
    .map(c => ({
      type: c.type,
      message: c.message,
    }));
  if (errors.length > 0) {
    const ready = conditions.find(c => c.type === 'Ready');
    if (ready.status === 'False') {
      errors.push({
        type: ready.type,
        message: ready.message,
      });
    }
  }
  return errors;
};

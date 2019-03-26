import { get } from 'lodash';

import { getStatusPhase } from '../common';

export const hasMigrationStatus = (migration, status) => {
  const phase = getStatusPhase(migration);
  return phase && phase.toLowerCase() === status.toLowerCase();
};

export const isMigrating = migration =>
  migration && !hasMigrationStatus(migration, 'succeeded') && !hasMigrationStatus(migration, 'failed');

export const getMigrationVmiName = migration => get(migration, 'spec.vmiName');

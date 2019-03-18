import { get } from 'lodash';

export const getMigrationStatusPhase = migration => get(migration, 'status.phase');

export const hasMigrationStatus = (migration, status) => {
  const phase = getMigrationStatusPhase(migration);
  return phase && phase.toLowerCase() === status.toLowerCase();
};

export const isMigrating = migration =>
  migration && !hasMigrationStatus(migration, 'succeeded') && !hasMigrationStatus(migration, 'failed');

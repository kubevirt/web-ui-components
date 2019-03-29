import { getMigrationVmiName, isMigrating } from '.';

import { getName, getNamespace } from '..';

export const findVMIMigration = (migrations, vmi) => {
  if (!migrations) {
    return null;
  }

  return migrations
    .filter(m => getNamespace(m) === getNamespace(vmi) && getMigrationVmiName(m) === getName(vmi))
    .find(isMigrating);
};

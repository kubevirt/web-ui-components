import { migrate } from '../migrate';
import { k8sCreate } from '../../tests/k8sCreate';
import { blueVmi } from '../../tests/mocks/vmi/blue.mock';
import { VirtualMachineInstanceMigrationModel } from '../../models';
import { getModelApi } from '../selectors';

describe('migrate.js', () => {
  it('migrate', () =>
    migrate(k8sCreate, blueVmi).then(migration => {
      expect(migration.apiVersion).toBe(getModelApi(VirtualMachineInstanceMigrationModel));
      expect(migration.kind).toBe(VirtualMachineInstanceMigrationModel.kind);
      expect(migration.metadata.name).toBe(`${blueVmi.metadata.name}-migration`);
      expect(migration.metadata.namespace).toBe(blueVmi.metadata.namespace);
      expect(migration.spec.vmiName).toBe(blueVmi.metadata.name);
      return migration;
    }));
});

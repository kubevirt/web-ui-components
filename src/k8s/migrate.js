import { VirtualMachineInstanceMigrationModel } from '../models';
import { getName, getNamespace } from '../selectors';
import { getModelApi } from './selectors';
import { prefixedId } from '../utils/utils';

class Migration {
  constructor() {
    this.data = {
      apiVersion: getModelApi(VirtualMachineInstanceMigrationModel),
      kind: VirtualMachineInstanceMigrationModel.kind,
      metadata: {
        generateName: null,
        namespace: null,
      },
      spec: {
        vmiName: null,
      },
    };
  }

  setName(name) {
    this.data.metadata.generateName = name;
  }

  setVmi(vmi) {
    this.data.metadata.namespace = getNamespace(vmi);
    this.data.spec.vmiName = getName(vmi);
  }

  build() {
    return this.data;
  }
}

export const getMigrationName = vmi => prefixedId(getName(vmi), 'migration-');

export const migrate = (k8sCreate, vmi) => {
  const migration = new Migration();
  migration.setName(getMigrationName(vmi));
  migration.setVmi(vmi);

  return k8sCreate(VirtualMachineInstanceMigrationModel, migration.build());
};

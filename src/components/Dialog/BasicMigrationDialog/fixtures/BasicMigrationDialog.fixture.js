import { BasicMigrationDialog } from '..';
import { k8sCreate } from '../../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { blueVmi } from '../../../../k8s/mock_vmi/blue.vmi';

export default [
  {
    component: BasicMigrationDialog,
    props: {
      onClose: () => {},
      onCancel: () => {},
      onMigrationError: () => {},
      k8sCreate,
      virtualMachineInstance: blueVmi,
    },
  },
];

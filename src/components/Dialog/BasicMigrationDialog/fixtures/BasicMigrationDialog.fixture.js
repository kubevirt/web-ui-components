import { BasicMigrationDialog } from '../BasicMigrationDialog';
import { k8sCreate } from '../../../../tests/k8s';
import { blueVmi } from '../../../../tests/mocks/vmi/blue.mock';

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

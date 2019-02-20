import { CreateDiskRow } from '../CreateDiskRow';
import { storageClasses } from '../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';

export default {
  component: CreateDiskRow,
  props: {
    storage: {},
    onChange: () => {},
    onAccept: () => {},
    onCancel: () => {},
    storageClasses,
    LoadingComponent: () => null,
  },
};

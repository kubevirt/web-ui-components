import { ConfigurationSummary } from '..';

import { units } from '../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { cloudInitTestVm } from '../../../k8s/mock_vm/cloudInitTestVm.mock';

export default {
  component: ConfigurationSummary,
  props: {
    vm: cloudInitTestVm,
    units,
    persistentVolumeClaims: [],
  },
};

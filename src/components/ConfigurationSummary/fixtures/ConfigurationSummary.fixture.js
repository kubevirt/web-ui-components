import { ConfigurationSummary } from '..';

import { units } from '../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';

export default {
  component: ConfigurationSummary,
  props: {
    vm: cloudInitTestVm,
    units,
    persistentVolumeClaims: [],
  },
};

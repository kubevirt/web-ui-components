import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';

import { ConfigurationSummary } from '..';

export default {
  component: ConfigurationSummary,
  props: {
    vm: cloudInitTestVm,
    persistentVolumeClaims: [],
    dataVolumes: [],
  },
};

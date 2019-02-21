import { ConfigurationSummary } from '..';

import { cloudInitTestVm } from '../../../tests/mocks/vm/cloudInitTestVm.mock';

export default {
  component: ConfigurationSummary,
  props: {
    vm: cloudInitTestVm,
    persistentVolumeClaims: [],
    dataVolumes: [],
  },
};

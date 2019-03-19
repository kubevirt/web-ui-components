import { VmStatus } from '../VmStatus';
import vmFixtures from '../../../utils/status/vm/fixtures/VmStatus.fixture';

export default [
  {
    name: 'Off',
    component: VmStatus,
    props: {
      vm: vmFixtures[0],
    },
  },
  {
    name: 'Running',
    component: VmStatus,
    props: {
      vm: vmFixtures[1],
    },
  },
];

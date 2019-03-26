import { VmStatus } from '../VmStatus';
import vmFixtures from '../../../utils/status/vm/fixtures/vmStatus.fixture';

export default [
  {
    name: 'Off',
    component: VmStatus,
    props: {
      vm: vmFixtures[0].vm,
    },
  },
  {
    name: 'Running',
    component: VmStatus,
    props: {
      vm: vmFixtures[1].vm,
    },
  },
];

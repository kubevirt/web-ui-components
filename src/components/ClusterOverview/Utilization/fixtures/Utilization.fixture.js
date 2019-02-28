import { Utilization } from '../Utilization';

import { utilizationStats } from '../..';

export default {
  component: Utilization,
  props: { ...utilizationStats },
};

import { ocsHealthData } from './Health.fixture';

import HealthBody from '../HealthBody';

export default [
  {
    component: HealthBody,
    props: { ...ocsHealthData },
  },
];

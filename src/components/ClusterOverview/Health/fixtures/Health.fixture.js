import { Health, Compliance } from '../Health';

import { complianceData } from '../..';

export const healthData = {
  data: {
    healthy: false,
    message: 'Error message',
  },
  loaded: true,
};

export default [
  {
    component: Health,
    props: { ...healthData },
  },
  {
    component: Compliance,
    props: { ...complianceData },
  },
];

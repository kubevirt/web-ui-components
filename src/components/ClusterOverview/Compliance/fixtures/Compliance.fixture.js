import { Compliance } from '../Compliance';

import { complianceData } from '../..';

export default [
  {
    component: Compliance,
    name: 'Compliance',
    props: { ...complianceData },
  },
  {
    component: Compliance,
    name: 'Loading compliance',
    props: {},
  },
  {
    component: Compliance,
    name: 'Compliance in error state',
    props: {
      complianceData: {
        result: 'nok',
      },
    },
  },
];

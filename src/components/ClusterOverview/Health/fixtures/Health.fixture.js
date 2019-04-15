import { Health } from '../Health';
import { healthData as subsystemHealthData } from '../../../SubsystemHealth/fixtures/SubsystemHealth.fixture';

export const healthData = {
  data: {
    ...subsystemHealthData.data,
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
];

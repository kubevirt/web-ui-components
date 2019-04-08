import { OCSHealth } from '../Health';

export const ocsHealthData = {
  data: {
    healthy: 0,
    message: 'Error message',
  },
  loaded: true,
};

export default [
  {
    component: OCSHealth,
    props: { ...ocsHealthData },
  },
];

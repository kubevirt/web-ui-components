import { OCSHealth } from '../Health';

export const ocsHealthData = {
  data: {
    healthy: 0,
    message: 'Health Ok',
  },
  loaded: true,
};

export const ocsHealthDataWarning = {
  data: {
    healthy: 1,
    message: 'Warning message',
  },
  loaded: true,
};

export const ocsHealthDataError = {
  data: {
    healthy: 2,
    message: 'Error message',
  },
  loaded: true,
};

export default [
  {
    component: OCSHealth,
    name: 'Health',
    props: { ...ocsHealthData },
  },
  {
    component: OCSHealth,
    name: 'Loading Health',
    props: {},
  },
  {
    component: OCSHealth,
    name: 'Error Health',
    props: { ...ocsHealthDataError },
  },
  {
    component: OCSHealth,
    name: 'Warning Health',
    props: { ...ocsHealthDataWarning },
  },
];

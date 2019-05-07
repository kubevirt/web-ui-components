import { OCSHealth } from '../Health';

export const ocsHealthResponse = {
  data: {
    result: [
      {
        value: [null, 0],
      },
    ],
  },
};

export const ocsHealthDataWarning = {
  data: {
    result: [
      {
        value: [null, 1],
      },
    ],
  },
};

export const ocsHealthDataError = {
  data: {
    result: [
      {
        value: [null, 2],
      },
    ],
  },
};

export default [
  {
    component: OCSHealth,
    props: {
      ocsHealthResponse,
    },
  },
  {
    component: OCSHealth,
    name: 'Loading Health',
    props: {},
  },
  {
    component: OCSHealth,
    name: 'Error Health',
    props: {
      ocsHealthResponse: ocsHealthDataError,
    },
  },
  {
    component: OCSHealth,
    name: 'Warning Health',
    props: {
      ocsHealthResponse: ocsHealthDataWarning,
    },
  },
];

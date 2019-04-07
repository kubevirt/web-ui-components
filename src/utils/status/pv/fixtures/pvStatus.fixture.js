import {
  PV_STATUS_AVAILABLE,
  PV_STATUS_BOUND,
  PV_STATUS_FAILED,
  PV_STATUS_RELEASED,
  PV_STATUS_DEFAULT,
} from '../constants';

const metadata = {
  name: 'my-pv',
};

const getPv = phase => ({
  metadata,
  status: {
    phase,
  },
});

const getResult = status => ({
  status,
});

export default [
  {
    pv: getPv('Available'),
    expected: getResult(PV_STATUS_AVAILABLE),
  },
  {
    pv: getPv('Bound'),
    expected: getResult(PV_STATUS_BOUND),
  },
  {
    pv: getPv('Failed'),
    expected: getResult(PV_STATUS_FAILED),
  },
  {
    pv: getPv('Released'),
    expected: getResult(PV_STATUS_RELEASED),
  },
  {
    pv: getPv(),
    expected: getResult(PV_STATUS_DEFAULT),
  },
];

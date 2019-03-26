import { PVC_STATUS_PENDING, PVC_STATUS_BOUND, PVC_STATUS_LOST, PVC_STATUS_DEFAULT } from '../constants';

const metadata = {
  name: 'my-pvc',
  namespace: 'my-namespace',
};

const getPvc = phase => ({
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
    pvc: getPvc('Pending'),
    expected: getResult(PVC_STATUS_PENDING),
  },
  {
    pvc: getPvc('Bound'),
    expected: getResult(PVC_STATUS_BOUND),
  },
  {
    pvc: getPvc('Lost'),
    expected: getResult(PVC_STATUS_LOST),
  },
  {
    pvc: getPvc(),
    expected: getResult(PVC_STATUS_DEFAULT),
  },
];

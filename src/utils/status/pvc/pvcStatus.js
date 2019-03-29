import { PVC_STATUS_PENDING, PVC_STATUS_BOUND, PVC_STATUS_LOST, PVC_STATUS_DEFAULT } from './constants';

import { getStatusPhase } from '../../../selectors';
import { NOT_HANDLED } from '../common';

const statusMapper = {
  Pending: PVC_STATUS_PENDING,
  Bound: PVC_STATUS_BOUND,
  Lost: PVC_STATUS_LOST,
};

const getMappedStatus = pvc => {
  const status = statusMapper[getStatusPhase(pvc)];

  if (status) {
    return {
      status,
    };
  }
  return NOT_HANDLED;
};

export const getPvcStatus = pvc => getMappedStatus(pvc) || { status: PVC_STATUS_DEFAULT };

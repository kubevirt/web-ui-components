import {
  PV_STATUS_AVAILABLE,
  PV_STATUS_BOUND,
  PV_STATUS_FAILED,
  PV_STATUS_RELEASED,
  PV_STATUS_DEFAULT,
} from './constants';

import { getStatusPhase } from '../../../selectors';
import { NOT_HANDLED } from '../common';

const statusMapper = {
  Available: PV_STATUS_AVAILABLE,
  Bound: PV_STATUS_BOUND,
  Failed: PV_STATUS_FAILED,
  Released: PV_STATUS_RELEASED,
};

const getMappedStatus = pv => {
  const status = statusMapper[getStatusPhase(pv)];

  if (status) {
    return {
      status,
    };
  }
  return NOT_HANDLED;
};

export const getPvStatus = pv => getMappedStatus(pv) || { status: PV_STATUS_DEFAULT };

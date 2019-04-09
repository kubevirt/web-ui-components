import { get } from 'lodash';

import { getCapacityStats } from '../../../selectors';
import { STATUS_RESULT_OK, STATUS_RESULT_ERROR } from '../../Dashboard/Inventory/utils';

const diskStatsToProps = disks => {
  const result = {
    [STATUS_RESULT_OK]: 0,
    [STATUS_RESULT_ERROR]: 0,
    count: null,
  };

  const cephOsdUpCount = getCapacityStats(get(disks, 'cephOsdUp'));
  const cephOsdDownCount = getCapacityStats(get(disks, 'cephOsdDown'));

  if (cephOsdUpCount || cephOsdDownCount) {
    result[STATUS_RESULT_OK] = cephOsdUpCount;
    result[STATUS_RESULT_ERROR] = cephOsdDownCount;
    result.count = cephOsdUpCount + cephOsdDownCount;
  }
  return result;
};

export default diskStatsToProps;

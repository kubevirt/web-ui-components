import { get } from '../../../../selectors';

import { NETWORKS_TAB_KEY } from '../constants';

export const getNetworks = (state, id) =>
  get(get(state, ['kubevirt', 'createVmWizards']), [id, NETWORKS_TAB_KEY, 'value']) || state;

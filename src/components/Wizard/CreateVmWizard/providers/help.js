import { PROVIDER_VMWARE } from './VMwareImportProvider/constants';

import { HELP_PROVIDER_VMWARE } from '../strings';

const helpResolver = {
  [PROVIDER_VMWARE]: HELP_PROVIDER_VMWARE,
};

export const getProviderHelp = provider => helpResolver[provider];

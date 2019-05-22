import { PROVIDER_VMWARE } from './VMwareImportProvider/constants';

import { getVmWareInitialState } from '../redux/initialState/providers/vmWareInitialState';
import { getVmwareProviderStateUpdate } from '../redux/stateUpdate/vmSettings/providers/vmWareStateUpdate';
import { validateVmwareProvider, isVmwareProviderValid } from '../redux/validations/providers/vmWareValidation';
import { cleanupVmWareProvider } from './VMwareImportProvider/utils';

const providers = [PROVIDER_VMWARE];

const initialStateFunctionResolver = {
  [PROVIDER_VMWARE]: getVmWareInitialState,
};

const stateUpdateFunctionResolver = {
  [PROVIDER_VMWARE]: getVmwareProviderStateUpdate,
};

const validateProviderFunctionResolver = {
  [PROVIDER_VMWARE]: validateVmwareProvider,
};

const isProviderValidFunctionResolver = {
  [PROVIDER_VMWARE]: isVmwareProviderValid,
};

const providerCleanupFunctionResolver = {
  [PROVIDER_VMWARE]: cleanupVmWareProvider,
};

export const getProviders = () => providers;

export const getProviderInitialState = (provider, ...args) => {
  const resolver = initialStateFunctionResolver[provider];
  return resolver && resolver(...args);
};

export const getProviderStateUpdater = provider => stateUpdateFunctionResolver[provider];

export const validateProvider = (provider, ...args) => {
  const resolver = validateProviderFunctionResolver[provider];
  return resolver && resolver(...args);
};

export const isProviderValid = (provider, ...args) => {
  const resolver = isProviderValidFunctionResolver[provider];
  return resolver ? resolver(...args) : true;
};

export const cleanupProvider = (provider, ...args) => {
  const cleanup = providerCleanupFunctionResolver[provider];
  if (cleanup) {
    cleanup(...args);
  }
};

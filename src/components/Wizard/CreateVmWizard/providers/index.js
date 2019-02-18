import { get } from 'lodash';

import { NAMESPACE_KEY, PROVIDER_KEY, PROVIDER_VMWARE } from '../constants';
import { isImageSourceType, settingsValue } from '../../../../k8s/selectors';
import { PROVISION_SOURCE_IMPORT } from '../../../../constants';

import { getVMWareSection } from './vmware';
import { startV2VVMWareController } from './v2vvmwareController';
import { HELP_PROVIDER_VMWARE } from '../strings';

const providerList = [PROVIDER_VMWARE];

const getProviderHelp = basicSettings => {
  const provider = settingsValue(basicSettings, PROVIDER_KEY);
  switch (provider) {
    case PROVIDER_VMWARE:
      return HELP_PROVIDER_VMWARE;
    default:
      return null;
  }
};

export const importProviders = (basicSettings, WithResources, k8sCreate, k8sGet, k8sPatch) => ({
  [PROVIDER_KEY]: {
    id: 'provider-dropdown',
    title: 'Provider',
    type: 'dropdown',
    defaultValue: '--- Select Provider ---',
    choices: providerList,
    required: true,
    onChange: (...opts) => onProviderChanged(k8sCreate, k8sGet, ...opts),
    isVisible: basicVmSettings => isImageSourceType(basicVmSettings, PROVISION_SOURCE_IMPORT),
    help: getProviderHelp(basicSettings),
  },
  ...getVMWareSection(basicSettings, WithResources, k8sCreate, k8sGet, k8sPatch),
});

const onProviderChanged = (k8sCreate, k8sGet, valueValidationPair, key, formValid, prevBasicSettings) => {
  startV2VVMWareController({ k8sCreate, k8sGet, namespace: get(prevBasicSettings[NAMESPACE_KEY], 'value') });
};

// REMOVE ME: https://docs.google.com/document/d/1ks4H-ImD-r0s5eV4FsP_73kRdAP6sKJTRbj8nClpyp0/edit#heading=h.pxnfysbkvz9f
// https://docs.google.com/document/d/1lfa3GeDNMKRYOmiObZymXjBOYjIC_g1mNfa_NN6P-Ls/edit?ts=5c51bead
// https://github.com/pkliczewski/provider-pod/tree/work

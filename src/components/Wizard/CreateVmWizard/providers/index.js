import { get } from 'lodash';

import { Alert } from 'patternfly-react';

import React from 'react';

import { NAMESPACE_KEY, PROVIDER_KEY, PROVIDER_VMWARE, PROVIDER_VMWARE_NAMESPACE_ALERT_KEY } from '../constants';
import { isImageSourceType, settingsValue } from '../../../../k8s/selectors';
import { PROVISION_SOURCE_IMPORT } from '../../../../constants';

import { getVMWareSection } from './vmware';
import { startV2VVMWareController } from './v2vvmwareController';
import { HELP_PROVIDER_VMWARE } from '../strings';

import { CUSTOM } from '../../../Form';

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

export const importProviders = (basicSettings, operatingSystems, WithResources, k8sCreate, k8sGet, k8sPatch) => ({
  [PROVIDER_VMWARE_NAMESPACE_ALERT_KEY]: {
    id: 'vcenter-namespace-alert',
    type: CUSTOM,
    title: ' ',
    CustomComponent: () => <Alert type="warning">Please select a namespace.</Alert>,
    isVisible: basicVmSettings =>
      isImageSourceType(basicVmSettings, PROVISION_SOURCE_IMPORT) && !settingsValue(basicSettings, NAMESPACE_KEY),
  },
  [PROVIDER_KEY]: {
    id: 'provider-dropdown',
    title: 'Provider',
    type: 'dropdown',
    defaultValue: '--- Select Provider ---',
    choices: providerList,
    required: true,
    onChange: (...opts) => onProviderChanged(k8sCreate, k8sGet, ...opts),
    isVisible: basicVmSettings =>
      settingsValue(basicSettings, NAMESPACE_KEY) && isImageSourceType(basicVmSettings, PROVISION_SOURCE_IMPORT),
    help: getProviderHelp(basicSettings),
  },
  ...getVMWareSection(basicSettings, operatingSystems, WithResources, k8sCreate, k8sGet, k8sPatch),
});

const onProviderChanged = (k8sCreate, k8sGet, valueValidationPair, key, formValid, prevBasicSettings) => {
  startV2VVMWareController({
    k8sCreate,
    k8sGet,
    namespace: get(prevBasicSettings[NAMESPACE_KEY], 'value'),
  });
};

import React from "react";
import { get } from 'lodash';

import { getResource } from '../../../../utils';
import { PodModel } from '../../../../models';
import { Dropdown } from '../../../Form';
import { isPodReady } from '../../../../k8s/selectors';

import { PROVIDER_VMWARE_PROVIDER_POD_NAME_KEY } from '../constants';

// TODO: so far jsut something what can be compiled - reimplement
// TODO repimplement to following: read VMs list from a connector pod instead of k8s API
// if Connector pod exists, query it
// otherwise empty
export const getVCenterVmsConnected = (basicSettings, WithResources) => {
  const providerPodName = basicSettings[PROVIDER_VMWARE_PROVIDER_POD_NAME_KEY];
  if (!providerPodName) {
    return ({ id, value }) => <Dropdown id={id} value={value} disabled />;
  }

  const resourceMap = {
    providerPod: {
      resource: getResource(PodModel, {
        namespace: basicSettings.namespace ? basicSettings.namespace.value : undefined,
        name: providerPodName,
        // note: field-selector for "status.phase=Running" does not work reliably, so let's filter on our own
      }),
    },
  };
  const resourceToProps = ({ providerPod }) => {
    console.log('--- getVCenterVmsConnected, providerPod = ', providerPod);
    console.log('--- getVCenterVmsConnected, providerPod.status.phase = ', get(providerPod, 'status.phase'));

    if (!isPodReady(providerPod)) {
      console.log('ProviderPod is not yet ready: ', providerPod);
      return {
        choices: [],
        disabled: true,
      };
    }
    // TODO: pass pod to new component wrapping generic HTTP request
    return {
      choices: ['vm1', 'vm2'], // TODO
      disabled: true,
    };
  };

  const VCenterVmsConnected = ({ onChange, id, value }) =>
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <Dropdown id={id} value={value} onChange={onChange} />
    </WithResources>;

  return VCenterVmsConnected;
};

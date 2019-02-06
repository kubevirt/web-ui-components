import React from "react";

import { getResource } from '../../../../utils';
import { SecretModel } from '../../../../models';
import { Dropdown } from '../../../Form';

// TODO: so far jsut something what can be compiled - reimplement
// TODO repimplement to following: read VMs list from a connector pod instead of k8s API
// if Connector pod exists, query it
// otherwise empty
export const getVCenterVmsConnected = (basicSettings, WithResources) => {
  const resourceMap = { // TODO: connect to a pod to get this
    vms: { // so far debug only:
      resource: getResource(SecretModel, {
        namespace: basicSettings.namespace ? basicSettings.namespace.value : undefined,
        // matchExpressions: [{ key: VCENTER_TYPE_LABEL, operator: 'Exists' }]
      }),
    },
  };
  const resourceToProps = ({ vCenterSecrets }) => {
    return {
      choices: ['vm1', 'vm2'],
      disabled: true,
    };
  };

  const VCenterVmsConnected = ({ onChange, id, value }) =>
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <Dropdown id={id} value={value} onChange={onChange} />
    </WithResources>;

  return VCenterVmsConnected;
};

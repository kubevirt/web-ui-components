import React from 'react';
import { get } from 'lodash';

import { getResource } from '../../../../utils';
import { V2VVMwareModel } from '../../../../models';
import { Dropdown } from '../../../Form';

import { NAMESPACE_KEY, PROVIDER_VMWARE_CONNECTION, PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY } from '../constants';

export const getVCenterVmsConnected = (basicSettings, WithResources) => {
  console.log('--- getVCenterVmsConnected, basicSettings: ', basicSettings);
  const v2vvmwareName = get(basicSettings, [
    PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
    'value',
    PROVIDER_VMWARE_CONNECTION,
    'V2VVmwareName',
  ]);
  console.log('--- getVCenterVmsConnected, v2vvmwareName: ', v2vvmwareName);

  const resourceMap = {
    v2vvmware: {
      resource: getResource(V2VVMwareModel, {
        name: v2vvmwareName,
        namespace: get(basicSettings[NAMESPACE_KEY], 'value'),
        isList: false,
      }),
    },
  };
  const resourceToProps = ({ v2vvmware }) => {
    const vms = get(v2vvmware, 'spec.vms');
    console.log('--- getVCenterVmsConnected, vms: ', vms);

    let choices = [];
    if (vms) {
      choices = vms.map(vm => vm.name);
    }

    return {
      choices, // value set by the controller
      disabled: !vms,
    };
  };

  const VCenterVmsConnected = ({ onChange, id, value }) => (
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <Dropdown id={id} value={value} onChange={onChange} />
    </WithResources>
  );

  return VCenterVmsConnected;
};

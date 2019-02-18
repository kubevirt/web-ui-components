import React from 'react';
import { get } from 'lodash';

import { getResource } from '../../../../utils';
import { V2VVMwareModel } from '../../../../models';
import { Dropdown } from '../../../Form';

import { NAMESPACE_KEY, PROVIDER_VMWARE_CONNECTION, PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY } from '../constants';

export const getVCenterVmsConnected = (basicSettings, WithResources) => {
  const v2vvmwareName = get(basicSettings, [
    PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
    'value',
    PROVIDER_VMWARE_CONNECTION,
    'V2VVmwareName',
  ]);

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

    // TODO: dummy use of VM detail. Will be finalized once the Conversion pod is ready.
    // Reference: http://pubs.vmware.com/vsphere-60/topic/com.vmware.wssdk.apiref.doc/vim.VirtualMachine.html
    console.log('--- getVCenterVmsConnected, vms: ', vms);
    (vms || []).forEach(vm => {
      if (vm.detail && vm.detail.raw) {
        const raw = JSON.parse(vm.detail.raw);
        console.log('--- parsed raw VM: ', raw);
      }
    });

    let choices = [];
    if (vms) {
      choices = vms.map(vm => vm.name);
    }

    return {
      choices, // value set by the controller
      disabled: !vms,
    };
  };

  // eslint-disable-next-line react/prop-types
  const VCenterVmsConnected = ({ onChange, id, value }) => (
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <Dropdown id={id} value={value} onChange={onChange} />
    </WithResources>
  );

  return VCenterVmsConnected;
};

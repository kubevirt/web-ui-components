import React from 'react';
import { get } from 'lodash';

import PropTypes from 'prop-types';

import { getResource } from '../../../../utils';
import { V2VVMwareModel } from '../../../../models';
import { Dropdown } from '../../../Form';

import { PROVIDER_SELECT_VM } from '../strings';
import { NAMESPACE_KEY, PROVIDER_VMWARE_CONNECTION, PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY } from '../constants';
import { settingsValue } from '../../../../k8s/selectors';

const VCenterVms = ({ onChange, id, value, extraProps }) => {
  const { WithResources, basicSettings } = extraProps;

  const v2vvmwareName = get(basicSettings, [
    PROVIDER_VMWARE_USER_PWD_AND_CHECK_KEY,
    'value',
    PROVIDER_VMWARE_CONNECTION,
    'V2VVmwareName',
  ]);

  if (!v2vvmwareName) {
    return <Dropdown id={id} value={PROVIDER_SELECT_VM} disabled />;
  }

  const resourceMap = {
    v2vvmware: {
      resource: getResource(V2VVMwareModel, {
        name: v2vvmwareName,
        namespace: settingsValue(basicSettings, NAMESPACE_KEY),
        isList: false,
      }),
    },
  };
  const resourceToProps = ({ v2vvmware }) => {
    const vms = get(v2vvmware, 'spec.vms');

    // TODO: dummy use of VM detail. Will be finalized once the Conversion pod is ready.
    // Reference: http://pubs.vmware.com/vsphere-60/topic/com.vmware.wssdk.apiref.doc/vim.VirtualMachine.html
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

  return (
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <Dropdown id={id} value={value} onChange={onChange} />
    </WithResources>
  );
};
VCenterVms.defaultProps = {
  id: undefined,
  value: undefined,
};
VCenterVms.propTypes = {
  onChange: PropTypes.func.isRequired,
  extraProps: PropTypes.object.isRequired,
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default VCenterVms;

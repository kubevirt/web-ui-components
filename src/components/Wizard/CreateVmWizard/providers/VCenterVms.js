import React from 'react';
import { get } from 'lodash';

import PropTypes from 'prop-types';

import { getResource } from '../../../../utils';
import { ConfigMapModel, V2VVMwareModel } from '../../../../models';
import { Dropdown } from '../../../Form';

import { PROVIDER_SELECT_VM } from '../strings';
import { NAMESPACE_KEY } from '../constants';
import { settingsValue, getV2VVmwareName } from '../../../../k8s/selectors';

import VCenterVmsWithPrefill from './VCenterVmsWithPrefill';
import {
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME,
  VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE,
} from '../../../../constants';

const VCenterVms = ({ onChange, onFormChange, id, value, extraProps, ...extra }) => {
  // the "value" is name of selected VMWare VM
  const { WithResources, basicSettings, operatingSystems, k8sGet } = extraProps;

  const v2vvmwareName = getV2VVmwareName(basicSettings);

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
    vmwareToKubevirtOsConfigMap: {
      resource: getResource(ConfigMapModel, {
        name: VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAME,
        namespace: VMWARE_TO_KUBEVIRT_OS_CONFIG_MAP_NAMESPACE,
        isList: false,
      }),
    },
  };
  const resourceToProps = ({ v2vvmware }) => {
    const vms = get(v2vvmware, 'spec.vms');
    let choices = [];
    if (vms) {
      choices = Array.from(new Set(vms.map(vm => vm.name))).sort();
    }

    return {
      choices, // value set by the controller
      disabled: !vms,
    };
  };

  return (
    <WithResources resourceMap={resourceMap} resourceToProps={resourceToProps}>
      <VCenterVmsWithPrefill
        id={id}
        value={value}
        onChange={onChange}
        onFormChange={onFormChange}
        basicSettings={basicSettings}
        operatingSystems={operatingSystems}
        k8sGet={k8sGet}
      />
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
  onFormChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default VCenterVms;

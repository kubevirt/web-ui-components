import React from 'react';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';

import { Dropdown } from '../../../Form';
import { settingsValue } from '../../../../k8s/selectors';

import {
  BATCH_CHANGES_KEY,
  CPU_KEY,
  DESCRIPTION_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
  NAME_KEY,
  INTERMEDIARY_NETWORKS_TAB_KEY,
  OPERATING_SYSTEM_KEY,
  PROVIDER_VMWARE_VM_KEY,
} from '../constants';
import { getVmwareToKubevirtOS } from './vmwareActions';
import { getValidationObject } from '../../../../utils';
import { CUSTOM_FLAVOR, VALIDATION_INFO_TYPE } from '../../../../constants';
import { getVmwareOsString } from '../strings';

const prefillGeneric = ({ basicSettings, formKey, lastPrefilledValue, vmVmware, vmwareValuePath }) => {
  let pair;
  const value = get(vmVmware, vmwareValuePath);
  if (value) {
    const formValue = settingsValue(basicSettings, formKey);
    if (!formValue || formValue === lastPrefilledValue) {
      if (lastPrefilledValue !== value) {
        // avoid infinite loop
        pair = { value, target: formKey };
      }
    }
  }
  return pair;
};

const prefillVmName = params => prefillGeneric({ ...params, formKey: NAME_KEY, vmwareValuePath: ['Config', 'Name'] });

const prefillVmDescription = params =>
  prefillGeneric({ ...params, formKey: DESCRIPTION_KEY, vmwareValuePath: ['Config', 'Annotation'] });

const prefillMemory = params =>
  prefillGeneric({ ...params, formKey: MEMORY_KEY, vmwareValuePath: ['Config', 'Hardware', 'MemoryMB'] });

const prefillCpu = params =>
  prefillGeneric({ ...params, formKey: CPU_KEY, vmwareValuePath: ['Config', 'Hardware', 'NumCPU'] });

export const prefillOperatingSystem = async ({
  basicSettings,
  operatingSystems,
  vmVmware,
  k8sGet,
  lastPrefilledValue,
}) => {
  const formValue = settingsValue(basicSettings, OPERATING_SYSTEM_KEY);

  const guestId = get(vmVmware, ['Config', 'GuestId']);
  const os = await getVmwareToKubevirtOS(operatingSystems, guestId, k8sGet);
  if (os) {
    // os is of format: { id, name }
    if (!formValue) {
      return { value: os, target: OPERATING_SYSTEM_KEY };
    }

    if (isEqual(formValue, lastPrefilledValue)) {
      return undefined; // nothing to do
    }
  }

  if (!formValue || !isEqual(formValue, lastPrefilledValue)) {
    const guestFullName = get(vmVmware, ['Config', 'GuestFullName']);
    return {
      value: formValue,
      target: OPERATING_SYSTEM_KEY,
      validation: getValidationObject(getVmwareOsString(guestFullName), VALIDATION_INFO_TYPE),
    };
  }
  return undefined;
};

// Just store data here, actual prefill will be handled within a callback in CreateVmWizard after passing through data in BasicSettingsTab
export const prefillNics = ({ vmVmware, lastPrefilledValue }) => {
  const devices = get(vmVmware, ['Config', 'Hardware', 'Device']);

  // If the device is a network card, it has "MacAddress" present
  // Source:
  //   - https://www.vmware.com/support/developer/converter-sdk/conv50_apireference/vim.vm.device.VirtualDevice.BackingInfo.html
  //   - https://www.vmware.com/support/developer/converter-sdk/conv50_apireference/vim.vm.device.VirtualDevice.html
  const networkDevices = (devices || []).filter(device => device.hasOwnProperty('MacAddress'));
  const value = networkDevices.map(device => ({
    name: get(device, ['DeviceInfo', 'Label']),
    mac: device.MacAddress,
    id: device.Key, // TODO: verify once the Conversion pod is implemented
  }));

  if (!isEqual(lastPrefilledValue, value)) {
    // avoid infinite loop
    return { value, target: INTERMEDIARY_NETWORKS_TAB_KEY }; // value is expected to be passed to NETWORKS_TAB_KEY
  }

  return undefined;
};

class VCenterVmsWithPrefill extends React.Component {
  state = {
    lastName: undefined, // last prefilled VM name value
    lastDescription: undefined,
    lastOS: undefined,
    lastCpu: undefined,
    lastMem: undefined,
    lastNics: undefined,
  };

  async prefillValues(vmVmware) {
    const { onFormChange, k8sGet, basicSettings, operatingSystems } = this.props;
    const result = [];
    const newState = {};

    const namePair = prefillVmName({ basicSettings, vmVmware, lastPrefilledValue: this.state.lastName });
    if (namePair) {
      newState.lastName = namePair.value;
      result.push(namePair);
    }

    const descrPair = prefillVmDescription({ basicSettings, vmVmware, lastPrefilledValue: this.state.lastDescription });
    if (descrPair) {
      newState.lastDescription = descrPair.value;
      result.push(descrPair);
    }

    const osPair = await prefillOperatingSystem({
      basicSettings,
      vmVmware,
      lastPrefilledValue: this.state.lastOS,
      k8sGet,
      operatingSystems,
    });
    if (osPair) {
      newState.lastOS = osPair.value;
      result.push(osPair);
    }

    const memPair = prefillMemory({ basicSettings, vmVmware, lastPrefilledValue: this.state.lastMem });
    if (memPair) {
      newState.lastMem = memPair.value;
      result.push({ value: CUSTOM_FLAVOR, target: FLAVOR_KEY });
      result.push(memPair);
    }

    const cpuPair = prefillCpu({ basicSettings, vmVmware, lastPrefilledValue: this.state.lastCpu });
    if (cpuPair) {
      newState.lastCpu = cpuPair.value;
      result.push(cpuPair);
    }

    const nics = prefillNics({ vmVmware, lastPrefilledValue: this.state.lastNics });
    if (nics) {
      newState.lastNics = nics.value;
      result.push(nics);
    }

    if (result.length > 0) {
      this.setState(newState);
      onFormChange({ value: result }, BATCH_CHANGES_KEY);
    }
  }

  componentDidUpdate() {
    const { v2vvmware, basicSettings } = this.props;

    if (v2vvmware) {
      const selectedVmName = settingsValue(basicSettings, PROVIDER_VMWARE_VM_KEY);
      if (this.state.lastName !== selectedVmName) {
        // just once
        const vms = get(v2vvmware, 'spec.vms');
        const vmWithDetail = (vms || []).find(vm => vm.name === selectedVmName && vm.detail && vm.detail.raw);
        if (vmWithDetail) {
          const vmVmware = JSON.parse(vmWithDetail.detail.raw);
          this.prefillValues(vmVmware);
        }
      }
    }
  }

  render() {
    const { id, value, onChange, choices, disabled } = this.props;
    return <Dropdown id={id} value={value} onChange={onChange} choices={choices} disabled={disabled} />;
  }
}
VCenterVmsWithPrefill.defaultProps = {
  value: undefined,
  choices: [],
  disabled: true,
  v2vvmware: undefined,
};
VCenterVmsWithPrefill.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
  basicSettings: PropTypes.object.isRequired,
  operatingSystems: PropTypes.array.isRequired,
  k8sGet: PropTypes.func.isRequired,
  v2vvmware: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  choices: PropTypes.array,
  disabled: PropTypes.bool,
};

export default VCenterVmsWithPrefill;

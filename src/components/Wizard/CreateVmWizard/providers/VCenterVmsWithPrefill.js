import React from 'react';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';

import { Dropdown } from '../../../Form';
import { settingsValue } from '../../../../k8s/selectors';

import {
  BATCH_CHANGES_KEY,
  CPU_KEY,
  PROVIDER_VMWARE_VM_DATA_KEY,
  DESCRIPTION_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
  NAME_KEY,
  INTERMEDIARY_NETWORKS_TAB_KEY,
  OPERATING_SYSTEM_KEY,
  PROVIDER_VMWARE_VM_KEY,
  INTERMEDIARY_STORAGE_TAB_KEY,
  STORAGE_TYPE_EXTERNAL_IMPORT,
  STORAGE_TYPE_EXTERNAL_V2V_TEMP,
  STORAGE_TYPE_EXTERNAL_V2V_VDDK,
} from '../constants';
import { getValidationObject } from '../../../../utils';
import { CUSTOM_FLAVOR, VALIDATION_INFO_TYPE } from '../../../../constants';
import { getVmwareOsString } from '../strings';
import { CONVERSION_POD_TEMP_MOUNT_PATH, CONVERSION_POD_VDDK_MOUNT_PATH } from '../../../../k8s/requests/v2v';

const prefillGeneric = ({ basicSettings, formKey, lastPrefilledValue, vmVmware, vmwareValuePath, convertNewValue }) => {
  let pair;
  let value = get(vmVmware, vmwareValuePath);
  if (convertNewValue) {
    value = convertNewValue(value);
  }

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
  prefillGeneric({
    ...params,
    formKey: MEMORY_KEY,
    vmwareValuePath: ['Config', 'Hardware', 'MemoryMB'],
    convertNewValue: value => value / 1024,
  });

const prefillCpu = params =>
  prefillGeneric({ ...params, formKey: CPU_KEY, vmwareValuePath: ['Config', 'Hardware', 'NumCPU'] });

export const prefillVmData = async ({ basicSettings, additionalData, lastPrefilledValue }) => {
  if (!isEqual(additionalData, lastPrefilledValue)) {
    return {
      value: additionalData,
      target: PROVIDER_VMWARE_VM_DATA_KEY,
    };
  }
  return undefined;
};

/**
 * Provides mapping from VMWare GuesId to common-templates operating system.
 *
 * https://code.vmware.com/docs/4206/vsphere-web-services-api-reference#/doc/vim.vm.GuestOsDescriptor.GuestOsIdentifier.html
 *
 * The vmwareToKubevirtOsConfigMap is usually created by the web-ui-operator and can be missing.
 *
 * operatingSystems - see getTemplateOperatingSystems() in selectors.js
 */
export const prefillOperatingSystem = async ({
  basicSettings,
  operatingSystems,
  vmVmware,
  vmwareToKubevirtOsConfigMap,
  lastPrefilledValue,
}) => {
  const formValue = settingsValue(basicSettings, OPERATING_SYSTEM_KEY);

  const guestId = get(vmVmware, ['Config', 'GuestId']);

  const kubevirtId = get(vmwareToKubevirtOsConfigMap, ['data', guestId]);
  const os = operatingSystems.find(o => o.id === kubevirtId);
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

// Just store data here, actual prefill will be handled within a callback in CreateVmWizard after passing through data in BasicSettingsTab
export const prefillDisks = ({ vmVmware, lastDisks }) => {
  const devices = get(vmVmware, ['Config', 'Hardware', 'Device']);

  // if the device is a disk, it has "capacityInKB" present
  // Alternatively:
  //   diskObjectId - since vSphere API 5.5
  //   capacityInBytes - since vSphere API 5.5
  //   capacityInKB - deprecated since vSphere API 5.5
  // https://www.vmware.com/support/developer/converter-sdk/conv50_apireference/vim.vm.device.VirtualDisk.html
  // TODO: what about CDROM, Floppy, VirtualSCSIPassthrough,
  const diskDevices = (devices || []).filter(
    device => device.hasOwnProperty('CapacityInKB') || device.hasOwnProperty('CapacityInBytes')
  );

  const diskRows = diskDevices.map((device, idx) => {
    const capacityKib = device.CapacityInBytes / 1024 || device.CapacityInKB;

    return {
      id: idx,
      storageType: STORAGE_TYPE_EXTERNAL_IMPORT,
      name: get(device, ['DeviceInfo', 'Label']),
      size: capacityKib / (1024 * 1024),
      storageClass: undefined, // Let the user select proper mapping
      isBootable: idx === 0, // TODO get and set the real boot order
      data: {
        fileName: get(device, ['Backing', 'FileName']),
        mountPath: `/data/vm/disk${idx + 1}`, // hardcoded
      },
    };
  });

  // temp disk needed for conversion pod
  diskRows.push({
    id: diskRows.length,
    storageType: STORAGE_TYPE_EXTERNAL_V2V_TEMP,
    name: 'v2v-conversion-temp',
    size: 2,
    storageClass: undefined,
    data: {
      mountPath: CONVERSION_POD_TEMP_MOUNT_PATH,
    },
  });

  // TODO: make vddk configurable or move setup to somewhere else
  // vddk pvc must be present in the same namespace as the VM
  diskRows.push({
    editable: false,
    id: diskRows.length,
    storageType: STORAGE_TYPE_EXTERNAL_V2V_VDDK,
    name: 'vddk-pvc',
    storageClass: undefined,
    data: {
      mountPath: CONVERSION_POD_VDDK_MOUNT_PATH,
    },
  });

  if (!isEqual(lastDisks, diskRows)) {
    // avoid infinite loop
    return { value: diskRows, target: INTERMEDIARY_STORAGE_TAB_KEY }; // value is expected to be passed to STORAGE_TAB_KEY
  }

  return undefined;
};

class VCenterVmsWithPrefill extends React.Component {
  state = {
    lastName: undefined, // last prefilled VM name value
    lastDescription: undefined,
    lastOS: undefined,
    lastVmData: undefined,
    lastCpu: undefined,
    lastMem: undefined,
    lastNics: undefined,
    lastDisks: undefined,
  };

  async prefillValues(vmVmware, additionalData) {
    const { onFormChange, vmwareToKubevirtOsConfigMap, basicSettings, operatingSystems } = this.props;
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
      vmwareToKubevirtOsConfigMap,
      operatingSystems,
    });
    if (osPair) {
      newState.lastOS = osPair.value;
      result.push(osPair);
    }

    const vmDataPair = await prefillVmData({
      basicSettings,
      additionalData,
      lastPrefilledValue: this.state.lastVmData,
    });
    if (vmDataPair) {
      newState.lastVmData = vmDataPair.value;
      result.push(vmDataPair);
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

    const disks = prefillDisks({ vmVmware, lastDisks: this.state.lastDisks });
    if (disks) {
      newState.lastDisks = disks.value;
      result.push(disks);
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
          const { hostPath, raw } = vmWithDetail.detail;
          const vmVmware = JSON.parse(raw);
          this.prefillValues(vmVmware, { hostPath, thumbPrint: get(v2vvmware, 'spec.thumbprint') });
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
  vmwareToKubevirtOsConfigMap: undefined,
};
VCenterVmsWithPrefill.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
  basicSettings: PropTypes.object.isRequired,
  operatingSystems: PropTypes.array.isRequired,
  vmwareToKubevirtOsConfigMap: PropTypes.object,
  v2vvmware: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  choices: PropTypes.array,
  disabled: PropTypes.bool,
};

export default VCenterVmsWithPrefill;

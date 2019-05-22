import { get } from '../../../../../../../selectors';

import {
  CPU_KEY,
  DESCRIPTION_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
  NAME_KEY,
  OPERATING_SYSTEM_KEY,
  STORAGE_TYPE_EXTERNAL_IMPORT,
  STORAGE_TYPE_EXTERNAL_V2V_TEMP,
  STORAGE_TYPE_EXTERNAL_V2V_VDDK,
  USE_CLOUD_INIT_KEY,
  WORKLOAD_PROFILE_KEY,
} from '../../../../constants';
import { getVmwareAttribute } from '../../../../providers/VMwareImportProvider/selectors';
import { getVmSettingAttribute } from '../../../../utils/vmSettingsTabUtils';
import { PROVIDER_VMWARE_VM_KEY } from '../../../../providers/VMwareImportProvider/constants';
import { CONVERSION_POD_TEMP_MOUNT_PATH, CONVERSION_POD_VDDK_MOUNT_PATH } from '../../../../../../../k8s/requests/v2v';
import { CUSTOM_FLAVOR } from '../../../../../../../constants';
import { internalTypes, vmWizardInternalActions, types, vmWizardActions } from '../../../actions';

/**
 * Provides mapping from VMWare GuesId to common-templates operating system.
 *
 * https://code.vmware.com/docs/4206/vsphere-web-services-api-reference#/doc/vim.vm.GuestOsDescriptor.GuestOsIdentifier.html
 *
 * The vmwareToKubevirtOsConfigMap is usually created by the web-ui-operator and can be missing.
 */
// update checks done in vmWareStateUpdate
export const prefillUpdateCreator = options => {
  const { id, props, dispatch, getState } = options;
  const state = getState();
  const vm = getVmwareAttribute(state, id, PROVIDER_VMWARE_VM_KEY, 'vm');
  const { vmwareToKubevirtOsConfigMap } = props;

  const raw = vm.getIn(['detail', 'raw']);

  const parsedVm = JSON.parse(raw);

  const memory = get(parsedVm, ['Config', 'Hardware', 'MemoryMB']);
  const guestId = get(parsedVm, ['Config', 'GuestId']);
  const kubevirtId = get(vmwareToKubevirtOsConfigMap, ['data', guestId]);
  const os = getVmSettingAttribute(state, id, OPERATING_SYSTEM_KEY, 'operatingSystems', []).find(
    o => get(o, 'id') === kubevirtId
  );

  dispatch(
    vmWizardInternalActions[internalTypes.updateVmSettingsInternal](id, {
      [NAME_KEY]: {
        value: get(parsedVm, ['Config', 'Name'], null),
      },
      [DESCRIPTION_KEY]: {
        value: get(parsedVm, ['Config', 'Annotation'], null),
      },
      [MEMORY_KEY]: {
        value: memory ? memory / 1024 : null,
      },
      [CPU_KEY]: {
        value: get(parsedVm, ['Config', 'Hardware', 'NumCPU'], null),
      },
      [OPERATING_SYSTEM_KEY]: {
        value: os || null,
        guestFullName: get(parsedVm, ['Config', 'GuestFullName'], null),
      },
      [FLAVOR_KEY]: {
        value: CUSTOM_FLAVOR,
      },
      [WORKLOAD_PROFILE_KEY]: {
        value: null,
      },
      [USE_CLOUD_INIT_KEY]: {
        value: false, // should reset all other cloud init fields
      },
    })
  );
  dispatch(vmWizardActions[types.setNetworks](id, getNics(parsedVm)));
  dispatch(vmWizardActions[types.setStorages](id, getDisks(parsedVm)));
};

export const getNics = parsedVm => {
  const devices = get(parsedVm, ['Config', 'Hardware', 'Device']);

  // If the device is a network card, it has "MacAddress" present
  // Source:
  //   - https://www.vmware.com/support/developer/converter-sdk/conv50_apireference/vim.vm.device.VirtualDevice.BackingInfo.html
  //   - https://www.vmware.com/support/developer/converter-sdk/conv50_apireference/vim.vm.device.VirtualDevice.html
  const networkDevices = (devices || []).filter(device => device.hasOwnProperty('MacAddress'));
  return networkDevices.map(device => ({
    name: get(device, ['DeviceInfo', 'Label']),
    mac: device.MacAddress,
    id: device.Key, // TODO: verify once the Conversion pod is implemented
  }));
};

export const getDisks = parsedVm => {
  const devices = get(parsedVm, ['Config', 'Hardware', 'Device']);

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

  return diskRows;
};

import React from 'react';
import { mount, shallow } from 'enzyme/build';
import { cloneDeep } from 'lodash';

import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';
import { k8sGet } from '../../../../../tests/k8s';
import { flushPromises } from '../../../../../tests/enzyme';

import VCenterVmsWithPrefill, { prefillDisks, prefillNics, prefillOperatingSystem } from '../VCenterVmsWithPrefill';
import {
  BATCH_CHANGES_KEY,
  PROVIDER_VMWARE_VM_KEY,
  NAME_KEY,
  DESCRIPTION_KEY,
  OPERATING_SYSTEM_KEY,
  INTERMEDIARY_NETWORKS_TAB_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
  CPU_KEY,
  INTERMEDIARY_STORAGE_TAB_KEY,
} from '../../constants';
import { getOperatingSystems } from '../../../../../k8s/selectors';
import { baseTemplates } from '../../../../../k8s/objects/template';
import { CUSTOM_FLAVOR, VALIDATION_INFO_TYPE } from '../../../../../constants';

const props = {
  id: 'my-id',
  value: 'vm-name',
  choices: ['one-vm', 'vm-name'],
  basicSettings: basicSettingsImportVmwareNewConnection,
  k8sGet,
  operatingSystems: getOperatingSystems(basicSettingsImportVmwareNewConnection, baseTemplates),
};
props.basicSettings[PROVIDER_VMWARE_VM_KEY] = {
  value: 'vm-name',
};

const vmwareVm = {
  Config: {
    Name: 'vm-name',
    Annotation: 'My description',
    GuestId: 'win2k8',
    GuestFullName: 'Windows Name',
    Hardware: {
      NumCPU: 2,
      MemoryMB: 128,
      Device: [
        {
          Key: 600,
          DeviceInfo: {
            Label: 'Keyboard ',
            Summary: 'Keyboard',
          },
          Backing: null,
          Connectable: null,
          SlotInfo: null,
        },
        {
          Key: 4000,
          DeviceInfo: {
            Label: 'nic0',
            Summary: 'description of nic0',
          },
          Backing: {},
          Connectable: {},
          SlotInfo: {},
          AddressType: 'assigned',
          MacAddress: '00:50:56:a5:ff:de',
          WakeOnLanEnabled: true,
          ExternalId: '',
        },
        {
          Key: 4001,
          DeviceInfo: {
            Label: 'nic1',
            Summary: 'description of nic1',
          },
          MacAddress: '00:50:56:a5:ff:de',
        },
        {
          Key: 2000,
          DeviceInfo: {
            Label: 'disk0',
            Summary: 'description of disk0',
          },
          Backing: {
            FileName: '[datastore12] ftp-01/ftp-01.vmdk',
            Datastore: {
              Type: 'Datastore',
              Value: 'datastore-45',
            },
            BackingObjectId: '',
            DiskMode: 'persistent',
            Split: false,
            WriteThrough: false,
            ThinProvisioned: true,
            EagerlyScrub: null,
            Uuid: '6000C297-5043-93c2-12ca-f44ae8af4881',
            ContentId: 'ee1918ce88582c53457b0c75fffffffe',
            ChangeId: '',
            Parent: null,
            DeltaDiskFormat: '',
            DigestEnabled: false,
            DeltaGrainSize: 0,
            DeltaDiskFormatVariant: '',
            Sharing: 'sharingNone',
            KeyId: null,
          },
          Connectable: null,
          SlotInfo: null,
          ControllerKey: 1000,
          UnitNumber: 0,
          CapacityInKB: 1,
          CapacityInBytes: 1024,
          Shares: {
            Shares: 1000,
            Level: 'normal',
          },
          StorageIOAllocation: {
            Limit: -1,
            Shares: {
              Shares: 1000,
              Level: 'normal',
            },
            Reservation: 0,
          },
          DiskObjectId: '61-2000',
          VFlashCacheConfigInfo: null,
          Iofilter: null,
          VDiskId: null,
          NativeUnmanagedLinkedClone: null,
        },
        {
          Key: 2001,
          DeviceInfo: {
            Label: 'disk1',
            Summary: 'description of disk1',
          },
          Backing: {
            FileName: 'filename1',
          },
          CapacityInBytes: 2048,
        },
      ],
    },
  },
};

const v2vvmware = {
  spec: {
    vms: [
      {
        name: 'one-vm',
      },
      {
        name: 'unknown-vm',
      },
      {
        name: 'vm-name',
        detail: {
          raw: JSON.stringify(vmwareVm),
        },
      },
    ],
  },
};

describe('<VCenterVmsWithPrefill />', () => {
  it('renders correctly', () => {
    const onChange = jest.fn();
    const onFormChange = jest.fn();
    const wrapper = shallow(<VCenterVmsWithPrefill {...props} onChange={onChange} onFormChange={onFormChange} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does prefill', async () => {
    const failedRhel7 = {
      value: { id: 'rhel7.0', name: 'Red Hat Enterprise Linux 7.0' },
      target: OPERATING_SYSTEM_KEY,
      validation: { message: 'Select matching for: Windows Name', type: VALIDATION_INFO_TYPE },
    };

    const onChange = jest.fn();
    const onFormChange = jest.fn();
    const wrapper = mount(<VCenterVmsWithPrefill {...props} onChange={onChange} onFormChange={onFormChange} />);
    expect(wrapper).toMatchSnapshot();
    expect(onChange.mock.calls).toHaveLength(0);
    expect(onFormChange.mock.calls).toHaveLength(0);

    wrapper.setProps({ v2vvmware }); // force componentDidUpdate containing async processing
    await flushPromises();
    expect(onChange.mock.calls).toHaveLength(0);
    expect(onFormChange.mock.calls).toHaveLength(1);
    expect(onFormChange.mock.calls[0][0].value).toHaveLength(7);
    expect(onFormChange.mock.calls[0][1]).toBe(BATCH_CHANGES_KEY);
    expect(onFormChange.mock.calls[0][0].value[0]).toEqual({ value: 'My description', target: DESCRIPTION_KEY }); // name is skipped as it was provided by the user

    // the value is already pre-selected by the user, so no matching
    expect(onFormChange.mock.calls[0][0].value[1]).toEqual(failedRhel7);

    expect(onFormChange.mock.calls[0][0].value[2]).toEqual({ value: CUSTOM_FLAVOR, target: FLAVOR_KEY });
    expect(onFormChange.mock.calls[0][0].value[3]).toEqual({ value: 128, target: MEMORY_KEY });
    expect(onFormChange.mock.calls[0][0].value[4]).toEqual({ value: 2, target: CPU_KEY });

    expect(onFormChange.mock.calls[0][0].value[5]).toEqual({
      value: [
        { id: 4000, mac: '00:50:56:a5:ff:de', name: 'nic0' },
        { id: 4001, mac: '00:50:56:a5:ff:de', name: 'nic1' },
      ],
      target: INTERMEDIARY_NETWORKS_TAB_KEY,
    });

    expect(onFormChange.mock.calls[0][0].value[6]).toEqual({
      value: [
        { id: 2000, name: 'disk0', fileName: '[datastore12] ftp-01/ftp-01.vmdk', capacity: 1024 },
        { id: 2001, name: 'disk1', fileName: 'filename1', capacity: 2048 },
      ],
      target: INTERMEDIARY_STORAGE_TAB_KEY,
    });

    const newBasicSettings = cloneDeep(props.basicSettings);
    newBasicSettings[NAME_KEY] = '';
    wrapper.setProps({ basicSettings: newBasicSettings });
    await flushPromises();
    expect(onFormChange.mock.calls).toHaveLength(2);
    expect(onFormChange.mock.calls[1][1]).toBe(BATCH_CHANGES_KEY);
    expect(onFormChange.mock.calls[1][0].value[0]).toEqual({ value: 'vm-name', target: NAME_KEY }); // description is skipped as it is equal with former run
  });

  it('handles prefillOperatingSystem() with already preselected value by user', async () => {
    const result = await prefillOperatingSystem({
      basicSettings: basicSettingsImportVmwareNewConnection,
      operatingSystems: getOperatingSystems(basicSettingsImportVmwareNewConnection, baseTemplates),
      vmVmware: vmwareVm,
      k8sGet,
      lastPrefilledValue: '',
    });
    expect(result).toEqual({
      target: 'operatingSystem',
      validation: { message: 'Select matching for: Windows Name', type: 'info' },
      value: { id: 'rhel7.0', name: 'Red Hat Enterprise Linux 7.0' },
    });
  });

  it('handles successful prefillOperatingSystem()', async () => {
    const fedora = cloneDeep(vmwareVm);
    fedora.Config.GuestId = 'fedora28_guest';
    fedora.Config.GuestFullName = 'Fedora OS Name';

    const basicSettings = cloneDeep(basicSettingsImportVmwareNewConnection);
    delete basicSettings[OPERATING_SYSTEM_KEY];

    const result = await prefillOperatingSystem({
      basicSettings,
      operatingSystems: getOperatingSystems(basicSettingsImportVmwareNewConnection, baseTemplates),
      vmVmware: fedora,
      k8sGet,
      lastPrefilledValue: '',
    });
    expect(result).toEqual({
      target: 'operatingSystem',
      value: { id: 'fedora28', name: 'Fedora 28' },
    });
  });

  it('handles failing prefillOperatingSystem()', async () => {
    const fedora = cloneDeep(vmwareVm);
    fedora.Config.GuestId = 'unknown_id';
    fedora.Config.GuestFullName = 'A random OS';

    const basicSettings = cloneDeep(basicSettingsImportVmwareNewConnection);
    delete basicSettings[OPERATING_SYSTEM_KEY];

    const result = await prefillOperatingSystem({
      basicSettings,
      operatingSystems: getOperatingSystems(basicSettingsImportVmwareNewConnection, baseTemplates),
      vmVmware: fedora,
      k8sGet,
      lastPrefilledValue: '',
    });
    expect(result).toEqual({
      target: 'operatingSystem',
      validation: { message: 'Select matching for: A random OS', type: 'info' },
      value: undefined,
    });
  });

  it('handlers prefillNics()', () => {
    const result = prefillNics({ vmVmware: vmwareVm, lastPrefilledValue: undefined });
    expect(result.target).toBe(INTERMEDIARY_NETWORKS_TAB_KEY);
    expect(result.value).toHaveLength(2);
    expect(result.value[0].id).toBe(4000);
    expect(result.value[1].id).toBe(4001);
    expect(result.value[0].name).toBe('nic0');
    expect(result.value[1].name).toBe('nic1');
  });

  it('handlers prefillDisks()', () => {
    const result = prefillDisks({ vmVmware: vmwareVm, lastPrefilledValue: undefined });
    expect(result.target).toBe(INTERMEDIARY_STORAGE_TAB_KEY);
    expect(result.value).toHaveLength(2);
    expect(result.value[0].id).toBe(2000);
    expect(result.value[1].id).toBe(2001);
    expect(result.value[0].name).toBe('disk0');
    expect(result.value[1].name).toBe('disk1');
  });
});

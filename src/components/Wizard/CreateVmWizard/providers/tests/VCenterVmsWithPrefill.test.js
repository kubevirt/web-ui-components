import React from 'react';
import { mount, shallow } from 'enzyme/build';

import { basicSettingsImportVmwareNewConnection } from '../../../../../tests/forms_mocks/basicSettings.mock';
import { k8sGet } from '../../../../../tests/k8s';
import { flushPromises } from '../../../../../tests/enzyme';

import VCenterVmsWithPrefill from '../VCenterVmsWithPrefill';
import {
  BATCH_CHANGES_KEY,
  PROVIDER_VMWARE_VM_KEY,
  NAME_KEY,
  DESCRIPTION_KEY,
  OPERATING_SYSTEM_KEY,
} from '../../constants';
import { getOperatingSystems } from '../../../../../k8s/selectors';
import { baseTemplates } from '../../../../../k8s/objects/template';
import { VALIDATION_INFO_TYPE } from '../../../../../constants';

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
          raw: JSON.stringify({
            Config: {
              Name: 'vm-name',
              Annotation: 'My description',
              GuestId: 'win2k8',
              GuestFullName: 'Windows Name',
            },
          }),
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
    const onChange = jest.fn();
    const onFormChange = jest.fn();
    const wrapper = mount(<VCenterVmsWithPrefill {...props} onChange={onChange} onFormChange={onFormChange} />);
    expect(wrapper).toMatchSnapshot();
    expect(onChange.mock.calls).toHaveLength(0);
    expect(onFormChange.mock.calls).toHaveLength(0);

    wrapper.setProps({ v2vvmware }); // force componentDidUpdate containing async processing
    await flushPromises();
    expect(onChange.mock.calls).toHaveLength(0);
    expect(onFormChange.mock.calls).toHaveLength(2);
    expect(onFormChange.mock.calls[0][1]).toBe(BATCH_CHANGES_KEY);
    expect(onFormChange.mock.calls[0][0].value[0]).toEqual({ value: 'My description', target: DESCRIPTION_KEY }); // name is skipped as it was provided by the user
    expect(onFormChange.mock.calls[1][0].value[0]).toEqual({
      // the value is already pre-selected by the user, so no matching
      value: { id: 'rhel7.0', name: 'Red Hat Enterprise Linux 7.0' },
      target: OPERATING_SYSTEM_KEY,
      validation: { message: 'Select matching for: Windows Name', type: VALIDATION_INFO_TYPE },
    });

    const newBasicSettings = Object.assign({}, props.basicSettings);
    newBasicSettings[NAME_KEY] = '';
    wrapper.setProps({ basicSettings: newBasicSettings });
    await flushPromises();
    expect(onFormChange.mock.calls).toHaveLength(3);
    expect(onFormChange.mock.calls[2][1]).toBe(BATCH_CHANGES_KEY);
    expect(onFormChange.mock.calls[2][0].value[0]).toEqual({ value: 'vm-name', target: NAME_KEY }); // description is skipped as it is equal with former run
  });
});

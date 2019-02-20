import React from 'react';
import { shallow, mount } from 'enzyme';
import { HelpBlock, noop, Alert } from 'patternfly-react';
import { cloneDeep } from 'lodash';

import { CloneDialog } from '..';

import { clone } from '../../../../k8s/clone';
import { default as CloneDialogFixture } from '../fixtures/CloneDialog.fixture';
import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';
import { Text, TextArea, Dropdown, Checkbox } from '../../../Form';
import { getName, getDescription, getNamespace } from '../../../../utils';
import { VIRTUAL_MACHINE_EXISTS } from '../../../../utils/strings';
import { settingsValue } from '../../../../k8s/selectors';
import { DESCRIPTION_KEY, NAME_KEY, NAMESPACE_KEY } from '../../../Wizard/CreateVmWizard/constants';
import { k8sCreate } from '../../../../tests/k8s';
import { flushPromises, setCheckbox, setInput, clickButton, selectDropdownItem } from '../../../../tests/enzyme';

jest.mock('../../../../k8s/clone');

const testCloneDialog = (vms = [], onClose = noop, vm = cloudInitTestVm) => (
  <CloneDialog {...CloneDialogFixture.props} virtualMachines={vms} onClose={onClose} vm={vm} k8sCreate={k8sCreate} />
);

const setVmName = (component, value) => setInput(component.find('#vm-name').find(Text), value);

const setVmDescription = (component, value) => setInput(component.find('#vm-description').find(TextArea), value);

const startVm = (component, checked) => setCheckbox(component.find('#start-vm').find(Checkbox), checked);

const clickCloneVm = component => clickButton(component, 'Clone Virtual Machine');

const getNameValidation = component => {
  const wrapper = component.find(HelpBlock).at(0);
  return wrapper.exists() ? wrapper.text() : null;
};

const selectNamespace = (component, namespace) => {
  const namespaceDropdown = component.find('#namespace-dropdown');
  selectDropdownItem(namespaceDropdown, namespace);
};

describe('<CloneDialog />', () => {
  beforeEach(() => {
    clone.mockClear();
  });

  it('renders correctly', () => {
    const component = shallow(testCloneDialog());
    expect(component).toMatchSnapshot();
  });

  it('sets default form values when dialog opens', () => {
    const component = mount(testCloneDialog());
    expect(
      component
        .find('#vm-name')
        .find(Text)
        .props().value
    ).toEqual(`${getName(cloudInitTestVm)}-clone`);
    expect(
      component
        .find('#vm-description')
        .find(TextArea)
        .props().value
    ).toEqual(getDescription(cloudInitTestVm));
    expect(
      component
        .find('#namespace-dropdown')
        .find(Dropdown)
        .props().value
    ).toEqual(getNamespace(cloudInitTestVm));
  });

  it('validates existing VM', () => {
    const vm1 = {
      metadata: {
        name: 'fooname',
        namespace: 'default',
      },
    };

    const vm2 = {
      metadata: {
        name: 'fooname1',
        namespace: 'myproject',
      },
    };

    const component = mount(testCloneDialog([vm1, vm2]));
    expect(getNameValidation(component)).toEqual(null);

    setVmName(component, getName(vm1));
    expect(getNameValidation(component)).toEqual(`Name ${VIRTUAL_MACHINE_EXISTS}`);

    selectNamespace(component, getNamespace(vm2));
    expect(getNameValidation(component)).toEqual(null);

    setVmName(component, getName(vm2));
    expect(getNameValidation(component)).toEqual(`Name ${VIRTUAL_MACHINE_EXISTS}`);

    setVmName(component, 'othername');
    expect(getNameValidation(component)).toEqual(null);
  });

  it('calls clone when clicked on finish', async () => {
    let component = mount(testCloneDialog());

    clone.mockReturnValue(new Promise((resolve, reject) => resolve()));

    clickCloneVm(component);

    await flushPromises();

    expect(clone).toHaveBeenCalled();
    expect(clone.mock.calls[0][3]).toEqual(settingsValue(component.state(), NAME_KEY));
    expect(clone.mock.calls[0][4]).toEqual(settingsValue(component.state(), NAMESPACE_KEY));
    expect(clone.mock.calls[0][5]).toEqual(settingsValue(component.state(), DESCRIPTION_KEY));
    expect(clone.mock.calls[0][6]).toEqual(false);

    component = mount(testCloneDialog());

    setVmName(component, 'newname');
    setVmDescription(component, 'newdescription');
    selectNamespace(component, 'myproject');
    startVm(component, true);

    clickCloneVm(component);

    await flushPromises();

    expect(clone.mock.calls[1][3]).toEqual('newname');
    expect(clone.mock.calls[1][4]).toEqual('myproject');
    expect(clone.mock.calls[1][5]).toEqual('newdescription');
    expect(clone.mock.calls[1][6]).toEqual(true);
  });

  it('show error when clone fails', async () => {
    clone.mockReturnValue(Promise.reject(new Error('fooError')));
    const component = mount(testCloneDialog());

    clickCloneVm(component);
    await flushPromises();

    expect(clone).toHaveBeenCalled();
    component.update();

    expect(component.find(Alert).text()).toEqual('fooError');
  });

  it('shows warning when vm is running', () => {
    const runningVm = cloneDeep(cloudInitTestVm);
    runningVm.spec.running = true;
    const component = mount(testCloneDialog([], noop, runningVm));

    expect(component.find(Alert).text()).toEqual(
      `The VM ${getName(runningVm)} is still running. It will be powered off while cloning.`
    );

    runningVm.spec.running = false;

    component.setProps({
      vm: runningVm,
    });
  });
});

/* eslint-disable no-console */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { WizardPattern } from 'patternfly-react';

import { Provider } from 'react-redux';

import { CreateVmWizard as CreateWizard, CreateVmWizardComponent } from '../CreateVmWizard';
import CreateVmWizardFixutre from '../fixtures/CreateVmWizard.fixture';
import store from '../../../../tests/redux/store';
import { CREATE_VM, CREATE_VM_TEMPLATE, NEXT } from '../strings';
import { VmSettingsTab } from '../VmSettingsTab';

const testCreateVmWizard = createTemplate => {
  const [loaded] = CreateVmWizardFixutre;
  const { props } = loaded;
  return (
    <Provider store={store}>
      <CreateWizard {...props} createTemplate={createTemplate} />
    </Provider>
  );
};

describe('<CreateVmWizard />', () => {
  beforeEach(() => {
    console.warn = jest.fn(); // redux Id warning when not properly connected to the store
  });

  it('it renders', () => {
    const component = mount(testCreateVmWizard());
    expect(component.html()).toMatchSnapshot(); // expect(component).toMatchSnapshot() freezes
  });

  it('is not visible when rendered without store', () => {
    const component = shallow(testCreateVmWizard())
      .dive()
      .dive()
      .shallow();
    expect(component.find(WizardPattern)).toHaveLength(0);
  });

  it('is visible when mounted and calls uninitialized reduxId warn', () => {
    const component = mount(testCreateVmWizard());
    expect(component.find(WizardPattern).props().show).toBeTruthy();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("onStepChanged doesn't update activeStepIndex due to invalid form", () => {
    const component = mount(testCreateVmWizard()).find(CreateVmWizardComponent);
    expect(component.state().activeStepIndex).toEqual(0);
    component.instance().onStepChanged(1);
    expect(component.state().activeStepIndex).toEqual(0);
  });

  it('checks initial values', () => {
    const component = mount(testCreateVmWizard()).find(CreateVmWizardComponent);
    expect(component.find('.modal-title').text()).toEqual(CREATE_VM);
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
    expect(component.find(WizardPattern).props().nextText).toBe(NEXT);

    expect(component.find('#template-dropdown').exists()).toBeTruthy();
    expect(component.find(VmSettingsTab)).toHaveLength(1);
  });

  // TODO: add 2v2 tests
});

describe('<CreateVmWizard /> template', () => {
  beforeEach(() => {
    console.warn = jest.fn();
  });

  it('is visible when mounted and calls uninitialized reduxId warn', () => {
    const component = mount(testCreateVmWizard(true));
    expect(component.find(WizardPattern).props().show).toBeTruthy();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('checks initial values', () => {
    const component = mount(testCreateVmWizard(true)).find(CreateVmWizardComponent);
    expect(component.find('.modal-title').text()).toEqual(CREATE_VM_TEMPLATE);
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
    expect(component.find(WizardPattern).props().nextText).toBe(NEXT);

    expect(component.find('#template-dropdown').exists()).toBeFalsy();
    expect(component.find(VmSettingsTab)).toHaveLength(1);
  });
});

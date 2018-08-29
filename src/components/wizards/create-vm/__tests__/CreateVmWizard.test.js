import React from 'react';
import { shallow } from 'enzyme';
import { CreateVmWizard } from '../CreateVmWizard';
import { os } from '../../new-vm/OperatingSystem';
import { workloadProfiles, flavors, templates, namespaces } from '../../new-vm/NewVmWizard.fixtures';
import { WizardPattern } from 'patternfly-react';

const onHide = () => {};

const testCreateVmWizard = () => (
  <CreateVmWizard
    onHide={onHide}
    workloadProfiles={workloadProfiles}
    flavors={flavors}
    operatingSystems={os}
    templates={templates}
    namespaces={namespaces}
  />
);

describe('<CreateVmWizard />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateVmWizard());
    expect(component).toMatchSnapshot();
  });
  it('is visible when mounted', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.find(WizardPattern).props().show).toBeTruthy();
  });
  it('is not valid when initially open', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.state().wizardValid).toBeFalsy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
  });
  it('onFormChange updates state', () => {
    const nameValue = 'someName';
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange(nameValue, 'name');
    expect(component.state().basicVmSettings.name).toEqual({ value: nameValue });
  });
  it('required property is validated', () => {
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange('', 'name');
    expect(component.state().basicVmSettings.name).toEqual({ value: '', validMsg: 'Name is required' });
  });
  it('cpu field validation is triggered', () => {
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange('someCpu', 'cpu');
    expect(component.state().basicVmSettings.cpu).toEqual({ value: 'someCpu', validMsg: 'CPUs must be a number' });
  });
  it('memory field validation is triggered', () => {
    const component = shallow(testCreateVmWizard());
    component.instance().onFormChange('someMemory', 'memory');
    expect(component.state().basicVmSettings.memory).toEqual({
      value: 'someMemory',
      validMsg: 'Memory (GB) must be a number'
    });
  });
  it('onStepChanged update state activeStepIndex', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.state().activeStepIndex).toEqual(0);
    component.instance().onStepChanged(1);
    expect(component.state().activeStepIndex).toEqual(1);
  });
  it('is valid when all required fields are filled', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.state().wizardValid).toBeFalsy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();

    component.instance().onFormChange('name', 'name');
    component.instance().onFormChange('namespace', 'namespace');
    component.instance().onFormChange('PXE', 'imageSourceType');
    component.instance().onFormChange('operatingSystem', 'operatingSystem');
    component.instance().onFormChange('flavor', 'flavor');
    component.instance().onFormChange('workloadProfile', 'workloadProfile');

    expect(component.state().wizardValid).toBeTruthy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeFalsy();

    // new required field will become visible
    component.instance().onFormChange('URL', 'imageSourceType');

    expect(component.state().wizardValid).toBeFalsy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import { NewVmWizard } from '../NewVmWizard';
import { workloadProfiles, flavors, templates, namespaces } from '../NewVmWizard.fixtures';
import { os } from '../OperatingSystem';
import { CreateVmWizard } from '../../create-vm/CreateVmWizard';
import { ImportVmWizard } from '../../import-vm/ImportVmWizard';

const testNewVmWizard = () => (
  <NewVmWizard
    onHide={() => {}}
    workloadProfiles={workloadProfiles}
    flavors={flavors}
    operatingSystems={os}
    templates={templates}
    namespaces={namespaces}
  />
);

describe('<NewVmWizard />', () => {
  it('renders correctly', () => {
    const component = shallow(testNewVmWizard());
    expect(component).toMatchSnapshot();
  });
  it('CreateVMWizard or ImportVmWizard are not rendered ', () => {
    const component = shallow(testNewVmWizard());
    expect(component.find(CreateVmWizard)).toHaveLength(0);
    expect(component.find(ImportVmWizard)).toHaveLength(0);
  });
  it('opens CreateVMWizard when button is clicked', () => {
    const component = shallow(testNewVmWizard());
    component.findWhere(c => c.props().label === 'Create New Virtual Machine').simulate('click');
    expect(component.find(CreateVmWizard)).toHaveLength(1);
  });
  it('opens ImportVMWizard when button is clicked', () => {
    const component = shallow(testNewVmWizard());
    component.findWhere(c => c.props().label === 'Import Existing Virtual Machine').simulate('click');
    expect(component.find(ImportVmWizard)).toHaveLength(1);
  });
});

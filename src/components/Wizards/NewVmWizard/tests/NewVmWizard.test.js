import React from 'react';
import { shallow } from 'enzyme';
import { NewVmWizard } from '../NewVmWizard';
import { namespaces } from '../fixtures/NewVmWizard.fixture';
import { CreateVmWizard } from '../../CreateVmWizard/CreateVmWizard';
import { templates, userTemplates, networkConfigs } from '../../../../constants';

const testNewVmWizard = () => (
  <NewVmWizard
    onHide={() => {}}
    templates={templates}
    namespaces={namespaces}
    userTemplates={userTemplates}
    networkConfigs={networkConfigs}
    k8sCreate={() => {}}
  />
);

describe('<NewVmWizard />', () => {
  it('renders correctly', () => {
    const component = shallow(testNewVmWizard());
    expect(component).toMatchSnapshot();
  });
  it('CreateVMWizard is not rendered ', () => {
    const component = shallow(testNewVmWizard());
    expect(component.find(CreateVmWizard)).toHaveLength(0);
  });
  it('opens CreateVMWizard when button is clicked', () => {
    const component = shallow(testNewVmWizard());
    component.findWhere(c => c.props().label === 'Create New Virtual Machine').simulate('click');
    expect(component.find(CreateVmWizard)).toHaveLength(1);
  });
});

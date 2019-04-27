import React from 'react';
import { shallow } from 'enzyme';

import { VmSettingsTab } from '../VmSettingsTab';
import { namespaces } from '../fixtures/CreateVmWizard.fixture';
import { baseTemplates } from '../../../../k8s/objects/template';
import { callerContext } from '../../../../tests/k8s';

import { userTemplates } from '../../../../tests/mocks/user_template';

import { urlTemplateDataVolume } from '../../../../tests/mocks/user_template/url.mock';

const templates = [...baseTemplates, ...userTemplates];

const testVmSettingsTab = (vmSettings, onChange = null, selectedNamespace = undefined, template = false) => (
  <VmSettingsTab
    templates={templates}
    namespaces={namespaces}
    onChange={onChange || jest.fn()}
    dataVolumes={[urlTemplateDataVolume]}
    {...callerContext}
  />
);

describe('<VmSettingsTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testVmSettingsTab());
    expect(component).toMatchSnapshot();
  });
  // TODO: add tests
});

describe('<VmSettingsTab /> for Create VM Template', () => {
  it('renders correctly', () => {
    const component = shallow(testVmSettingsTab({}, null, null, true));
    expect(component).toMatchSnapshot();
  });
});

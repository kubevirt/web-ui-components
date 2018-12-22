import React from 'react';
import { shallow, mount } from 'enzyme';
import { MenuItem } from 'patternfly-react';

import { BasicSettingsTab, getFormFields } from '../BasicSettingsTab';
import { namespaces } from '../fixtures/CreateVmWizard.fixture';
import { baseTemplates } from '../../../../k8s/mock_templates';
import { validBasicSettings } from '../fixtures/BasicSettingsTab.fixture';
import { DNS1123_START_ERROR } from '../../../../utils/strings';
import { getValidationObject } from '../../../../utils/validations';
import { getName, getMemory, getCpu, getCloudInitUserData } from '../../../../utils/selectors';
import { getTemplateProvisionSource } from '../../../../utils/templates';
import { Dropdown } from '../../../Form';
import { NO_TEMPLATE } from '../strings';
import { selectVm } from '../../../../k8s/selectors';
import {
  userTemplates,
  urlTemplate,
  containerTemplate,
  pxeTemplate,
  containerCloudTemplate,
  urlCustomFlavorTemplate,
} from '../../../../k8s/mock_user_templates';

import {
  NAME_KEY,
  USER_TEMPLATE_KEY,
  PROVISION_SOURCE_TYPE_KEY,
  IMAGE_URL_KEY,
  CONTAINER_IMAGE_KEY,
  CLOUD_INIT_KEY,
  USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CLOUD_INIT_CUSTOM_SCRIPT_KEY,
  CPU_KEY,
  FLAVOR_KEY,
  MEMORY_KEY,
} from '../constants';

import {
  PROVISION_SOURCE_PXE,
  PROVISION_SOURCE_CONTAINER,
  PROVISION_SOURCE_URL,
  CUSTOM_FLAVOR,
} from '../../../../constants';

const templates = [...baseTemplates, ...userTemplates];

const testBasicSettingsTab = (basicSettings = {}, onChange = null, selectedNamespace = undefined, template = false) => (
  <BasicSettingsTab
    templates={templates}
    namespaces={namespaces}
    selectedNamespace={selectedNamespace}
    basicSettings={basicSettings}
    onChange={onChange || jest.fn()}
    createVmTemplate={template}
  />
);

const expectMockToBeCalledWith = (fn, a, b, call = 0) => {
  expect(fn.mock.calls[call][0]).toEqual(a);
  expect(fn.mock.calls[call][1]).toEqual(b);
};

const testFormChange = (what, value, result, valid) => {
  const onChange = jest.fn();
  const component = mount(testBasicSettingsTab({}, onChange));

  onFormChange(component, value, what);

  expectMockToBeCalledWith(onChange, result, valid);
};

const onFormChange = (component, value, what) => {
  const formFields = getFormFields(validBasicSettings, namespaces, templates);

  const field = component.find(`#${formFields[what].id}`);
  if (formFields[what].type === 'dropdown') {
    field
      .find(MenuItem)
      .findWhere(item => item.text() === value)
      .find('a')
      .simulate('click');
  } else {
    field.find('input').simulate('change', { target: { value } });
  }
};

const checkDisabledDropdown = (component, template, disabled) => {
  component.setProps({
    basicSettings: {
      ...component.props().basicSettings,
      [USER_TEMPLATE_KEY]: {
        value: getName(template),
      },
    },
  });

  expect(
    component
      .find({ id: 'image-source-type-dropdown' })
      .find(Dropdown)
      .props().disabled
  ).toEqual(disabled.image);
  expect(
    component
      .find({ id: 'operating-system-dropdown' })
      .find(Dropdown)
      .props().disabled
  ).toEqual(disabled.os);
  expect(
    component
      .find({ id: 'flavor-dropdown' })
      .find(Dropdown)
      .props().disabled
  ).toEqual(disabled.flavor);
  expect(
    component
      .find({ id: 'workload-profile-dropdown' })
      .find(Dropdown)
      .props().disabled
  ).toEqual(disabled.workload);
};

const clickOnUserTemplate = (component, templateName) => {
  const templatesDropdown = component.find('#template-dropdown').find(Dropdown);
  const userTemplateItem = templatesDropdown
    .find(MenuItem)
    .findWhere(i => i.text() === templateName)
    .find(MenuItem);
  expect(userTemplateItem.exists()).toBeTruthy();

  userTemplateItem.find('a').simulate('click');
};

describe('<BasicSettingsTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testBasicSettingsTab());
    expect(component).toMatchSnapshot();
  });

  it('defaults to selectedNamespace', () => {
    const onChange = jest.fn();
    const namespace = namespaces[1];
    shallow(testBasicSettingsTab({}, onChange, namespace));

    expectMockToBeCalledWith(
      onChange,
      {
        namespace: {
          validation: undefined,
          value: namespace.metadata.name,
        },
      },
      false
    );
  });

  it('changes selectedNamespace on prop change', () => {
    const onChange = jest.fn();
    const basicSettings = {};
    const selectedNamespace = namespaces[1];

    const component = shallow(testBasicSettingsTab(basicSettings, onChange));

    expect(onChange).not.toHaveBeenCalled();

    component.setProps({
      templates,
      namespaces,
      selectedNamespace,
      basicSettings,
      onChange,
    });

    expectMockToBeCalledWith(
      onChange,
      {
        namespace: {
          validation: undefined,
          value: selectedNamespace.metadata.name,
        },
      },
      false
    );
  });

  it('validates incomplete form', () => {
    testFormChange(
      'name',
      'somename',
      {
        name: {
          validation: null,
          value: 'somename',
        },
      },
      false
    );
  });

  it('validates name field', () => {
    testFormChange(
      'name',
      'somename',
      {
        name: {
          validation: null,
          value: 'somename',
        },
      },
      false
    );
    testFormChange(
      'name',
      '_name',
      {
        name: {
          validation: getValidationObject(`Name ${DNS1123_START_ERROR}`),
          value: '_name',
        },
      },
      false
    );
  });

  it('is valid when all required fields are filled', () => {
    const onChange = jest.fn();
    const component = mount(testBasicSettingsTab(validBasicSettings, onChange));
    onFormChange(component, validBasicSettings.name.value, 'name'); // trigger validation

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        flavor: {
          value: 'small',
          validation: undefined,
        },
        name: {
          ...validBasicSettings.name,
          validation: null,
        },
      },
      true
    );
  });

  it('required property is validated', () => {
    testFormChange(
      'name',
      '',
      {
        name: {
          validation: getValidationObject('Name is required'),
          value: '',
        },
      },
      false
    );
  });

  it('is invalid when one required fields is missing', () => {
    const onChange = jest.fn();
    const component = mount(testBasicSettingsTab(validBasicSettings, onChange));

    onFormChange(component, '', NAME_KEY);

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        flavor: {
          value: 'small',
          validation: undefined,
        },
        name: {
          validation: getValidationObject('Name is required'),
          value: '',
        },
      },
      false
    );
  });

  it('reads provision source from user template', () => {
    const onChange = jest.fn();
    const component = mount(testBasicSettingsTab(validBasicSettings, onChange));

    onFormChange(component, getName(urlTemplate), USER_TEMPLATE_KEY);
    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: getName(urlTemplate),
          validation: undefined,
        },
        [PROVISION_SOURCE_TYPE_KEY]: {
          validation: undefined,
          value: PROVISION_SOURCE_URL,
        },
        [IMAGE_URL_KEY]: {
          validation: undefined,
          value: getTemplateProvisionSource(urlTemplate).source,
        },
      },
      true
    );

    onFormChange(component, getName(containerTemplate), USER_TEMPLATE_KEY);
    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: getName(containerTemplate),
          validation: undefined,
        },
        [PROVISION_SOURCE_TYPE_KEY]: {
          validation: undefined,
          value: PROVISION_SOURCE_CONTAINER,
        },
        [CONTAINER_IMAGE_KEY]: {
          validation: undefined,
          value: getTemplateProvisionSource(containerTemplate).source,
        },
      },
      true,
      1
    );

    onFormChange(component, getName(pxeTemplate), USER_TEMPLATE_KEY);
    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: getName(pxeTemplate),
          validation: undefined,
        },
        [PROVISION_SOURCE_TYPE_KEY]: {
          validation: undefined,
          value: PROVISION_SOURCE_PXE,
        },
      },
      true,
      2
    );
  });

  it('reads cloud init settings from user template', () => {
    const onChange = jest.fn();
    const component = mount(testBasicSettingsTab(validBasicSettings, onChange));

    onFormChange(component, getName(containerCloudTemplate), USER_TEMPLATE_KEY);
    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: getName(containerCloudTemplate),
          validation: undefined,
        },
        [PROVISION_SOURCE_TYPE_KEY]: {
          validation: undefined,
          value: PROVISION_SOURCE_CONTAINER,
        },
        [CONTAINER_IMAGE_KEY]: {
          value: 'fooContainer',
          validation: undefined,
        },
        [CLOUD_INIT_KEY]: {
          validation: undefined,
          value: true,
        },
        [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
          validation: undefined,
          value: true,
        },
        [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
          validation: undefined,
          value: getCloudInitUserData(selectVm(containerCloudTemplate.objects)),
        },
      },
      true
    );
  });

  it('reads flavor from user template', () => {
    const onChange = jest.fn();
    const component = mount(testBasicSettingsTab(validBasicSettings, onChange));

    onFormChange(component, getName(containerCloudTemplate), USER_TEMPLATE_KEY);

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: getName(containerCloudTemplate),
          validation: undefined,
        },
        [PROVISION_SOURCE_TYPE_KEY]: {
          validation: undefined,
          value: PROVISION_SOURCE_CONTAINER,
        },
        [CONTAINER_IMAGE_KEY]: {
          value: getTemplateProvisionSource(containerCloudTemplate).source,
          validation: undefined,
        },
        [CLOUD_INIT_KEY]: {
          validation: undefined,
          value: true,
        },
        [USE_CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
          validation: undefined,
          value: true,
        },
        [CLOUD_INIT_CUSTOM_SCRIPT_KEY]: {
          validation: undefined,
          value: getCloudInitUserData(selectVm(containerCloudTemplate.objects)),
        },
      },
      true
    );

    onFormChange(component, getName(urlCustomFlavorTemplate), USER_TEMPLATE_KEY);

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: getName(urlCustomFlavorTemplate),
          validation: undefined,
        },
        [PROVISION_SOURCE_TYPE_KEY]: {
          validation: undefined,
          value: PROVISION_SOURCE_URL,
        },
        [IMAGE_URL_KEY]: {
          value: getTemplateProvisionSource(urlCustomFlavorTemplate).source,
          validation: undefined,
        },
        [FLAVOR_KEY]: {
          value: CUSTOM_FLAVOR,
          validation: undefined,
        },
        [CPU_KEY]: {
          value: getCpu(urlCustomFlavorTemplate.objects[0]),
          validation: undefined,
        },
        [MEMORY_KEY]: {
          value: parseInt(getMemory(urlCustomFlavorTemplate.objects[0]), 10),
          validation: undefined,
        },
      },
      true,
      1
    );
  });

  it('provides no user template choice', () => {
    const onChange = jest.fn();
    const component = mount(testBasicSettingsTab(validBasicSettings, onChange));

    clickOnUserTemplate(component, getName(userTemplates[0]));

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: getName(userTemplates[0]),
          validation: undefined,
        },
        [CONTAINER_IMAGE_KEY]: {
          value: 'fooContainer',
        },
      },
      true
    );

    clickOnUserTemplate(component, NO_TEMPLATE);

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        [USER_TEMPLATE_KEY]: {
          value: undefined,
          validation: undefined,
        },
      },
      true,
      1
    );
  });

  it('disables provision source, workload and os for user template', () => {
    const component = mount(testBasicSettingsTab(validBasicSettings));

    checkDisabledDropdown(component, containerTemplate, {
      image: true,
      os: true,
      flavor: false,
      workload: true,
    });

    checkDisabledDropdown(component, urlCustomFlavorTemplate, {
      image: true,
      os: true,
      flavor: true,
      workload: true,
    });

    checkDisabledDropdown(component, undefined, {
      image: false,
      os: false,
      flavor: false,
      workload: false,
    });
  });
});

describe('<BasicSettingsTab /> for Create VM Template', () => {
  it('renders correctly', () => {
    const component = shallow(testBasicSettingsTab({}, null, null, true));
    expect(component).toMatchSnapshot();
  });
});

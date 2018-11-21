import React from 'react';
import { shallow } from 'enzyme';
import cloneDeep from 'lodash/cloneDeep';
import BasicSettingsTab, { getFormFields } from '../BasicSettingsTab';
import { namespaces } from '../fixtures/CreateVmWizard.fixture';
import { templates, PROVISION_SOURCE_TEMPLATE, TEMPLATE_TYPE_VM } from '../../../../constants';
import { getTemplate } from '../../../../utils/templates';
import { getName } from '../../../../utils/selectors';
import { validBasicSettings } from '../fixtures/BasicSettingsTab.fixture';
import { NAMESPACE_KEY, NAME_KEY } from '../constants';
import { DNS1123_START_ERROR } from '../../../../utils/strings';
import { getValidationObject } from '../../../../utils/validations';

const testCreateVmWizard = (basicSettings = {}, onChange = null, selectedNamespace = undefined) => (
  <BasicSettingsTab
    templates={templates}
    namespaces={namespaces}
    selectedNamespace={selectedNamespace}
    basicSettings={basicSettings}
    onChange={onChange || jest.fn()}
  />
);

const expectMockToBeCalledWith = (fn, a, b) => {
  expect(fn.mock.calls[0][0]).toEqual(a);
  expect(fn.mock.calls[0][1]).toEqual(b);
};

const testFormChange = (what, value, result, valid) => {
  const onChange = jest.fn();
  const component = shallow(testCreateVmWizard({}, onChange));

  onFormChange(component, value, what);

  expectMockToBeCalledWith(onChange, result, valid);
};

const onFormChange = (component, value, what) => {
  const formFields = getFormFields(validBasicSettings, namespaces, templates);
  component.instance().onFormChange(formFields, value, what);
};

describe('<BasicSettingsTab />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateVmWizard());
    expect(component).toMatchSnapshot();
  });

  it('defaults to selectedNamespace', () => {
    const onChange = jest.fn();
    const namespace = namespaces[1];
    shallow(testCreateVmWizard({}, onChange, namespace));

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

    const component = shallow(testCreateVmWizard(basicSettings, onChange));

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
    const component = shallow(testCreateVmWizard(validBasicSettings, onChange));
    onFormChange(component, validBasicSettings.name.value, 'name'); // trigger validation

    const validSettings = cloneDeep(validBasicSettings);
    validSettings[NAME_KEY].validation = null;
    expectMockToBeCalledWith(onChange, validSettings, true);
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
    const component = shallow(testCreateVmWizard(validBasicSettings, onChange));
    onFormChange(component, '', NAMESPACE_KEY);

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        namespace: {
          validation: getValidationObject('Namespace is required'),
          value: '',
        },
      },
      false
    );
  });

  it('selects template for template provision source', () => {
    const onChange = jest.fn();
    const component = shallow(testCreateVmWizard(validBasicSettings, onChange));
    onFormChange(component, PROVISION_SOURCE_TEMPLATE, 'imageSourceType');

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        imageSourceType: {
          value: PROVISION_SOURCE_TEMPLATE,
        },
        userTemplate: {
          value: getName(getTemplate(templates, TEMPLATE_TYPE_VM)[0]),
        },
      },
      false
    );
  });
});

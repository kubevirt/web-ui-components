import React from 'react';
import { shallow } from 'enzyme';
import BasicSettingsTab, { getFormFields } from '../BasicSettingsTab';
import { namespaces } from '../../NewVmWizard/fixtures/NewVmWizard.fixture';
import { templates } from '../../../../constants';
import { validBasicSettings } from '../fixtures/BasicSettingsTab.fixture';

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
  expect(fn.mock.calls[0][1]).toBe(b);
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
          validMsg: undefined,
          value: namespace.metadata.name
        }
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
      onChange
    });

    expectMockToBeCalledWith(
      onChange,
      {
        namespace: {
          validMsg: undefined,
          value: selectedNamespace.metadata.name
        }
      },
      false
    );
  });

  it('validates incomplete form', () => {
    testFormChange(
      'name',
      'someName',
      {
        name: {
          validMsg: undefined,
          value: 'someName'
        }
      },
      false
    );
  });

  it('is valid when all required fields are filled', () => {
    const onChange = jest.fn();
    const component = shallow(testCreateVmWizard(validBasicSettings, onChange));
    onFormChange(component, validBasicSettings.name.value, 'name'); // trigger validation

    expectMockToBeCalledWith(onChange, validBasicSettings, true);
  });

  it('required property is validated', () => {
    testFormChange(
      'name',
      '',
      {
        name: {
          validMsg: 'Name is required',
          value: ''
        }
      },
      false
    );
  });

  it('cpu field validation is triggered', () => {
    testFormChange(
      'cpu',
      'someCpu',
      {
        cpu: {
          validMsg: 'CPUs must be a number',
          value: 'someCpu'
        }
      },
      false
    );
  });

  it('memory field validation is triggered', () => {
    testFormChange(
      'memory',
      'someMemory',
      {
        memory: {
          validMsg: 'Memory (GB) must be a number',
          value: 'someMemory'
        }
      },
      false
    );
  });

  it('is invalid when one required fields is missing', () => {
    const onChange = jest.fn();
    const component = shallow(testCreateVmWizard(validBasicSettings, onChange));
    onFormChange(component, '', 'namespace');

    expectMockToBeCalledWith(
      onChange,
      {
        ...validBasicSettings,
        namespace: {
          validMsg: 'Namespace is required',
          value: ''
        }
      },
      false
    );
  });
});

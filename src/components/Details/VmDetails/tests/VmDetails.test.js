import React from 'react';
import { render, mount } from 'enzyme';
import { Button, MenuItem } from 'patternfly-react';

import { cloudInitTestVmi } from '../../../../k8s/mock_vmi/cloudInitTestVmi.mock';
import { VmDetails } from '../index';
import { vmFixtures, default as VmDetailsFixture } from '../fixtures/VmDetails.fixture';
import { InlineFormFactory } from '../../../Form/FormFactory';
import { Description } from '../../Description';
import { TextArea } from '../../../Form';
import { InlineEdit } from '../../../InlineEdit';
import { CUSTOM_FLAVOR } from '../../../../constants';

const testVmDetails = (vm, otherProps) => <VmDetails {...VmDetailsFixture[0].props} vm={vm} {...otherProps} />;

const expectMockWasCalledWith = (fn, jsonPatch, call = 0) => {
  expect(fn.mock.calls[call][2]).toEqual(jsonPatch);
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const awaitVmDetails = testFunc =>
  flushPromises().then(() => {
    testFunc();
    return testFunc;
  });

const getCpuInput = component =>
  component
    .find(InlineEdit)
    .find('#flavor-cpu')
    .find('input');

const getMemoryInput = component =>
  component
    .find(InlineEdit)
    .find('#flavor-memory')
    .find('input');

const selectFlavor = (component, flavor) => {
  const flavorDropdown = component.find('#flavor-dropdown');
  flavorDropdown
    .find(MenuItem)
    .findWhere(item => item.text() === flavor)
    .find('a')
    .simulate('click');
};

const clickButton = (component, buttonText) => getButton(component, buttonText).simulate('click');

const getButton = (component, buttonText) =>
  component
    .find(Button)
    .findWhere(button => button.text() === buttonText)
    .find('.btn');

const setInput = (input, value) => input.simulate('change', { target: { value } });

describe('<VmDetails />', () => {
  it('renders correctly', () => {
    const component = render(testVmDetails(vmFixtures.downVm));
    expect(component).toMatchSnapshot();
  });

  it('renders on status correctly', () => {
    const component = render(testVmDetails(vmFixtures.runningVm));
    expect(component).toMatchSnapshot();
  });

  it('renders off status correctly', () => {
    const component = render(testVmDetails(vmFixtures.downVm));
    expect(component).toMatchSnapshot();
  });

  it('renders description correctly', () => {
    const component = render(testVmDetails(vmFixtures.vmWithDescription));
    expect(component).toMatchSnapshot();
  });

  it('renders values from labels correctly', () => {
    const component = render(testVmDetails(vmFixtures.vmWithLabels));
    expect(component).toMatchSnapshot();
  });

  it('renders CPU and Memory settings for VM with custom flavor', () => {
    const component = render(testVmDetails(vmFixtures.customVm));
    expect(component).toMatchSnapshot();
  });

  it('does not render CPU and Memory settings for VM without custom flavor', () => {
    const component = render(testVmDetails(vmFixtures.vmWithSmallFlavor));
    expect(component).toMatchSnapshot();
  });

  it('renders IP addresses correctly', () => {
    const component = render(testVmDetails(vmFixtures.runningVm, { vmi: cloudInitTestVmi }));
    expect(component).toMatchSnapshot();
  });
});

describe('<VmDetails /> enzyme', () => {
  it('edit button triggers editing', () => {
    const component = mount(testVmDetails(vmFixtures.vmWithLabels));
    return awaitVmDetails(() => {
      expect(component.find(InlineFormFactory).exists()).toBeFalsy();
      clickButton(component, 'Edit');
      component.update();
      expect(component.find(InlineFormFactory)).toHaveLength(2);
      expect(
        component
          .find(Button)
          .findWhere(button => button.text() === 'Cancel')
          .exists()
      ).toBeTruthy();
      expect(
        component
          .find(Button)
          .findWhere(button => button.text() === 'Save')
          .exists()
      ).toBeTruthy();
    });
  });
  it('disables edit mode when clicked on cancel', () => {
    const component = mount(testVmDetails(vmFixtures.vmWithLabels));
    return awaitVmDetails(() => {
      expect(component.find(InlineFormFactory).exists()).toBeFalsy();
      clickButton(component, 'Edit');
      component.update();
      expect(component.find(InlineFormFactory)).toHaveLength(2);
      clickButton(component, 'Cancel');
      component.update();
      expect(component.find(InlineFormFactory).exists()).toBeFalsy();
      return component;
    });
  });
  it('updates VM description after clicking save button', () => {
    const k8sPatchMock = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolve();
      })
    );
    const component = mount(
      testVmDetails(vmFixtures.vmWithLabels, {
        k8sPatch: k8sPatchMock,
      })
    );
    return awaitVmDetails(() => {
      clickButton(component, 'Edit');
      component.update();

      const descriptionField = component.find(Description).find(TextArea);
      setInput(descriptionField, 'My new value');
      component.update();

      clickButton(component, 'Save');

      expectMockWasCalledWith(k8sPatchMock, [
        {
          op: 'add',
          path: '/metadata/annotations',
          value: { description: 'My new value' },
        },
      ]);
      expect(component.find(InlineFormFactory).exists()).toBeFalsy();
    });
  });

  it('updates VM flavor after clicking save button', () => {
    const k8sPatchMock = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolve();
      })
    );
    const component = mount(
      testVmDetails(vmFixtures.vmWithLabels, {
        k8sPatch: k8sPatchMock,
      })
    );
    return awaitVmDetails(() => {
      clickButton(component, 'Edit');
      component.update();

      selectFlavor(component, CUSTOM_FLAVOR);
      setInput(getCpuInput(component), 1);
      setInput(getMemoryInput(component), '1');

      component.update();

      clickButton(component, 'Save');

      expectMockWasCalledWith(k8sPatchMock, [
        {
          op: 'remove',
          path: '/metadata/labels/flavor.template.cnv.io~1small',
        },
        {
          op: 'add',
          path: '/metadata/labels/flavor.template.cnv.io~1Custom',
          value: 'true',
        },
        {
          op: 'replace',
          path: '/spec/template/spec/domain/cpu/sockets',
          value: 1,
        },
        {
          op: 'replace',
          path: '/spec/template/spec/domain/resources/requests/memory',
          value: '1G',
        },
      ]);
      expect(component.find(InlineFormFactory).exists()).toBeFalsy();
    });
  });

  it('disables save when form is invalid', () => {
    const component = mount(testVmDetails(vmFixtures.vmWithLabels));
    return awaitVmDetails(() => {
      expect(component.find(InlineFormFactory).exists()).toBeFalsy();
      clickButton(component, 'Edit');
      component.update();

      selectFlavor(component, CUSTOM_FLAVOR);
      component.update();

      setInput(getCpuInput(component), '');
      component.update();

      expect(getButton(component, 'Save').props().disabled).toBeTruthy();

      setInput(getCpuInput(component), '1');

      setInput(getMemoryInput(component), '1');
      component.update();

      expect(getButton(component, 'Save').props().disabled).toBeFalsy();
    });
  });
});

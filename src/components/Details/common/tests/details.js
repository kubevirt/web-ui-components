import { Button } from 'patternfly-react';

import { InlineFormFactory } from '../../../Form/FormFactory';
import { Description } from '../../Description';
import { TextArea } from '../../../Form';
import { InlineEdit } from '../../../InlineEdit';
import { CUSTOM_FLAVOR } from '../../../../constants';
import { getButton, clickButton, setInput, flushPromises, selectDropdownItem } from '../../../../tests/enzyme';

const expectMockWasCalledWith = (fn, jsonPatch, call = 0) => {
  expect(fn.mock.calls[call][2]).toEqual(jsonPatch);
};

const awaitVmDetails = testFunc =>
  flushPromises().then(() => {
    testFunc();
    return testFunc;
  });

const getCpuInput = (component, baseId) =>
  component
    .find(InlineEdit)
    .find(`#${baseId}-flavor-cpu`)
    .find('input');

const getMemoryInput = (component, baseId) =>
  component
    .find(InlineEdit)
    .find(`#${baseId}-flavor-memory`)
    .find('input');

const selectFlavor = (component, baseId, flavor) => {
  const flavorDropdown = component.find(`#${baseId}-flavor-dropdown`);
  selectDropdownItem(flavorDropdown, flavor);
};

export const editTriggersEditing = component =>
  awaitVmDetails(() => {
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

export const disablesEditOnCancel = component =>
  awaitVmDetails(() => {
    expect(component.find(InlineFormFactory).exists()).toBeFalsy();
    clickButton(component, 'Edit');
    component.update();
    expect(component.find(InlineFormFactory)).toHaveLength(2);
    clickButton(component, 'Cancel');
    component.update();
    expect(component.find(InlineFormFactory).exists()).toBeFalsy();
    return component;
  });

export const disablesSaveOnInvalidForm = (component, id) =>
  awaitVmDetails(() => {
    expect(component.find(InlineFormFactory).exists()).toBeFalsy();
    clickButton(component, 'Edit');
    component.update();

    selectFlavor(component, id, CUSTOM_FLAVOR);
    component.update();

    setInput(getCpuInput(component, id), '');
    component.update();

    expect(getButton(component, 'Save').props().disabled).toBeTruthy();

    setInput(getCpuInput(component, id), '1');

    setInput(getMemoryInput(component, id), '1');
    component.update();

    expect(getButton(component, 'Save').props().disabled).toBeFalsy();
  });

export const updatesFlavorOnSave = (component, id, k8sPatchMock, resourcesPatchPathPrefix = '') =>
  awaitVmDetails(() => {
    clickButton(component, 'Edit');
    component.update();

    selectFlavor(component, id, CUSTOM_FLAVOR);
    setInput(getCpuInput(component, id), 1);
    setInput(getMemoryInput(component, id), '1');

    component.update();

    clickButton(component, 'Save');

    expectMockWasCalledWith(k8sPatchMock, [
      {
        op: 'remove',
        path: '/metadata/labels/flavor.template.kubevirt.io~1small',
      },
      {
        op: 'add',
        path: '/metadata/labels/flavor.template.kubevirt.io~1Custom',
        value: 'true',
      },
      {
        op: 'replace',
        path: `${resourcesPatchPathPrefix}/spec/template/spec/domain/cpu/cores`,
        value: 1,
      },
      {
        op: 'replace',
        path: `${resourcesPatchPathPrefix}/spec/template/spec/domain/resources/requests/memory`,
        value: '1G',
      },
    ]);
    expect(component.find(InlineFormFactory).exists()).toBeFalsy();
  });

export const updatesDescriptionOnSave = (component, k8sPatchMock, obj) =>
  awaitVmDetails(() => {
    const newValue = 'My new value';
    clickButton(component, 'Edit');
    component.update();

    const descriptionField = component.find(Description).find(TextArea);
    setInput(descriptionField, newValue);
    component.update();

    clickButton(component, 'Save');

    const expectedPatch = obj.metadata.annotations
      ? {
          op: 'add',
          path: '/metadata/annotations/description',
          value: newValue,
        }
      : {
          op: 'add',
          path: '/metadata/annotations',
          value: { description: newValue },
        };

    expectMockWasCalledWith(k8sPatchMock, [expectedPatch]);
    expect(component.find(InlineFormFactory).exists()).toBeFalsy();
  });

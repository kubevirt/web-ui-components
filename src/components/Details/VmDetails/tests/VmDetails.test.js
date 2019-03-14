import React from 'react';
import { render, mount } from 'enzyme';

import { cloudInitTestVmi } from '../../../../tests/mocks/vmi/cloudInitTestVmi.mock';
import { VmDetails } from '../index';
import { vmFixtures, default as VmDetailsFixture } from '../fixtures/VmDetails.fixture';
import {
  disablesEditOnCancel,
  disablesSaveOnInvalidForm,
  editTriggersEditing,
  updatesDescriptionOnSave,
  updatesFlavorOnSave,
} from '../../common/tests/details';
import { getId } from '../../../../selectors';

const testVmDetails = (vm, otherProps) => <VmDetails {...VmDetailsFixture[0].props} vm={vm} {...otherProps} />;

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

  it('renders correctly as overview', () => {
    const component = render(testVmDetails(vmFixtures.runningVm, { overview: true }));
    expect(component).toMatchSnapshot();
  });
});

describe('<VmDetails /> enzyme', () => {
  it('edit button triggers editing', () => {
    const component = mount(testVmDetails(vmFixtures.vmWithLabels));
    return editTriggersEditing(component);
  });

  it('disables edit mode when clicked on cancel', () => {
    const component = mount(testVmDetails(vmFixtures.vmWithLabels));
    return disablesEditOnCancel(component);
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
    return updatesDescriptionOnSave(component, k8sPatchMock, vmFixtures.vmWithLabels);
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
    return updatesFlavorOnSave(component, getId(vmFixtures.vmWithLabels), k8sPatchMock);
  });

  it('disables save when form is invalid', () => {
    const component = mount(testVmDetails(vmFixtures.vmWithLabels));
    return disablesSaveOnInvalidForm(component, getId(vmFixtures.vmWithLabels));
  });
});

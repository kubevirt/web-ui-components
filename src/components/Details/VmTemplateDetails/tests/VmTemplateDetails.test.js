import React from 'react';
import { render, mount } from 'enzyme';

import { VmTemplateDetails } from '../index';
import { containerCloudTemplate, pxeDataVolumeTemplate } from '../../../../tests/mocks/user_template';
import { urlTemplate, urlTemplateDataVolume } from '../../../../tests/mocks/user_template/url.mock';
import { default as VmTemplateDetailsFixture } from '../fixtures/VmTemplateDetails.fixture';
import {
  disablesEditOnCancel,
  disablesSaveOnInvalidForm,
  editTriggersEditing,
  updatesDescriptionOnSave,
  updatesFlavorOnSave,
} from '../../common/tests/details';

const testVmTemplateDetails = (vmTemplate, props, dataVolumes = []) => (
  <VmTemplateDetails
    {...VmTemplateDetailsFixture[0].props}
    vmTemplate={vmTemplate}
    dataVolumes={dataVolumes}
    NamespaceResourceLink={() => vmTemplate.metadata.namespace}
    {...props}
  />
);

describe('<VmTemplateDetails />', () => {
  it('renders container correctly', () => {
    const component = render(testVmTemplateDetails(containerCloudTemplate));
    expect(component).toMatchSnapshot();
  });

  it('renders url correctly', () => {
    const component = render(testVmTemplateDetails(urlTemplate, null, [urlTemplateDataVolume]));
    expect(component).toMatchSnapshot();
  });

  it('renders pxe correctly', () => {
    const component = render(testVmTemplateDetails(pxeDataVolumeTemplate));
    expect(component).toMatchSnapshot();
  });
});

describe('<VmTemplateDetails /> enzyme', () => {
  it('edit button triggers editing', () => {
    const component = mount(testVmTemplateDetails(containerCloudTemplate));
    return editTriggersEditing(component);
  });

  it('disables edit mode when clicked on cancel', () => {
    const component = mount(testVmTemplateDetails(containerCloudTemplate));
    return disablesEditOnCancel(component);
  });

  it('updates VM Template description after clicking save button', () => {
    const k8sPatchMock = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolve();
      })
    );
    const component = mount(
      testVmTemplateDetails(containerCloudTemplate, {
        k8sPatch: k8sPatchMock,
      })
    );
    return updatesDescriptionOnSave(component, k8sPatchMock, containerCloudTemplate);
  });

  it('updates VM Template flavor after clicking save button', () => {
    const k8sPatchMock = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolve();
      })
    );
    const component = mount(
      testVmTemplateDetails(containerCloudTemplate, {
        k8sPatch: k8sPatchMock,
      })
    );
    return updatesFlavorOnSave(component, k8sPatchMock, '/objects/0');
  });

  it('disables save when form is invalid', () => {
    const component = mount(testVmTemplateDetails(containerCloudTemplate));
    return disablesSaveOnInvalidForm(component);
  });
});

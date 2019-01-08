import React from 'react';
import { shallow, mount } from 'enzyme';
import { findIndex } from 'lodash';
import { WizardPattern } from 'patternfly-react';

import { CreateVmWizard } from '../CreateVmWizard';
import { Loading } from '../../../Loading';
import { validBasicSettings } from '../fixtures/BasicSettingsTab.fixture';
import { createVm, createVmTemplate } from '../../../../k8s/request';
import { CREATE_VM, NEXT, CREATE_VM_TEMPLATE } from '../strings';
import CreateVmWizardFixutre from '../fixtures/CreateVmWizard.fixture';
import { BasicSettingsTab } from '../BasicSettingsTab';
import { NetworksTab } from '../NetworksTab';
import { StorageTab } from '../StorageTab';
import { ResultTab } from '../ResultTab';
import { getName } from '../../../../utils/selectors';
import { selectVm } from '../../../../k8s/selectors';
import { getTemplateInterfaces } from '../../../../utils/templates';

import {
  NETWORKS_TAB_KEY,
  BASIC_SETTINGS_TAB_KEY,
  STORAGE_TAB_KEY,
  RESULT_TAB_KEY,
  USER_TEMPLATE_KEY,
  PROVISION_SOURCE_TYPE_KEY,
} from '../constants';

import {
  containerTemplate,
  pxeDataVolumeTemplate,
  containerMultusTemplate,
  urlNoNetworkTemplate,
} from '../../../../k8s/mock_user_templates';

jest.mock('../../../../k8s/request');

const LOADING = 'loading';

const testCreateVmWizard = (type, template) => {
  let props;
  const [loaded, , loading] = CreateVmWizardFixutre;
  switch (type) {
    case LOADING:
      ({ props } = loading);
      break;
    default:
      ({ props } = loaded);
      break;
  }
  return <CreateVmWizard {...props} createTemplate={template} />;
};

const getBackButton = component => component.find('.btn').findWhere(btn => btn.text() === 'Back');
const getNextButton = component => component.find('.btn-primary');

const getStepIndex = (steps, key) => findIndex(steps, step => step.key === key);

const checkStorages = (component, userTemplate) => {
  expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(1);
  const stateTemplateStorage = component.state('stepData')[STORAGE_TAB_KEY].value[0].templateStorage;
  expect(stateTemplateStorage.disk).toEqual(selectVm(userTemplate.objects).spec.template.spec.domain.devices.disks[0]);
  if (stateTemplateStorage.dataVolume) {
    expect(stateTemplateStorage.dataVolume).toEqual(selectVm(userTemplate.objects).spec.dataVolumeTemplates[0]);
  }
  expect(stateTemplateStorage.volume).toEqual(selectVm(userTemplate.objects).spec.template.spec.volumes[0]);
};

const checkNetworks = (component, userTemplate) => {
  const templateInterfaces = getTemplateInterfaces(userTemplate);
  expect(component.state('stepData')[NETWORKS_TAB_KEY].value).toHaveLength(templateInterfaces.length);

  component.state('stepData')[NETWORKS_TAB_KEY].value.forEach((i, index) => {
    expect(i.templateNetwork).toEqual(templateInterfaces[index]);
  });
};

const checkRootNetworkExists = component => {
  expect(component.state('stepData')[NETWORKS_TAB_KEY].value).toHaveLength(1);
  expect(component.state('stepData')[NETWORKS_TAB_KEY].value[0].rootNetwork).toBeTruthy();
};

const testWalkThrough = (template = false, createText = CREATE_VM, templatesDropdown = true, createFunc = createVm) => {
  const component = mount(testCreateVmWizard(LOADING, template));
  expect(component.find('.modal-title').text()).toEqual(createText);

  expect(component.find(Loading)).toHaveLength(1);
  expect(component.find(BasicSettingsTab)).toHaveLength(0);

  const namespaces = [...CreateVmWizardFixutre[0].props.namespaces];
  const templates = [...CreateVmWizardFixutre[0].props.templates];
  component.setProps({ namespaces, templates });

  expect(component.find(Loading)).toHaveLength(0);
  expect(component.find(BasicSettingsTab)).toHaveLength(1);

  expect(component.find('#template-dropdown').exists()).toEqual(templatesDropdown);

  component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, validBasicSettings, true);
  component.update();
  expect(component.find(WizardPattern).props().nextStepDisabled).toBeFalsy();

  expect(getNextButton(component).text()).toEqual(NEXT);
  getNextButton(component).simulate('click');

  component.update();

  expect(component.find(Loading)).toHaveLength(1);
  expect(component.find(NetworksTab)).toHaveLength(0);

  const networkConfigs = [...CreateVmWizardFixutre[0].props.networkConfigs];
  component.setProps({ networkConfigs });

  expect(component.find(Loading)).toHaveLength(0);
  expect(component.find(NetworksTab)).toHaveLength(1);

  expect(component.state().activeStepIndex).toEqual(
    getStepIndex(component.instance().wizardStepsNewVM, NETWORKS_TAB_KEY)
  );

  getBackButton(component).simulate('click');
  component.update();

  expect(component.state().activeStepIndex).toEqual(
    getStepIndex(component.instance().wizardStepsNewVM, BASIC_SETTINGS_TAB_KEY)
  );
  expect(component.find(BasicSettingsTab)).toHaveLength(1);
  expect(component.find(NetworksTab)).toHaveLength(0);

  getNextButton(component).simulate('click');
  component.update();

  expect(component.find(BasicSettingsTab)).toHaveLength(0);
  expect(component.find(NetworksTab)).toHaveLength(1);
  expect(getNextButton(component).text()).toEqual(NEXT);

  getNextButton(component).simulate('click');
  component.update();

  expect(component.state().activeStepIndex).toEqual(
    getStepIndex(component.instance().wizardStepsNewVM, STORAGE_TAB_KEY)
  );
  expect(component.find(Loading)).toHaveLength(1);
  expect(component.find(StorageTab)).toHaveLength(0);

  const persistentVolumeClaims = [...CreateVmWizardFixutre[0].props.persistentVolumeClaims];
  const storageClasses = [...CreateVmWizardFixutre[0].props.storageClasses];
  component.setProps({ persistentVolumeClaims, storageClasses });

  expect(component.find(Loading)).toHaveLength(0);
  expect(component.find(StorageTab)).toHaveLength(1);

  expect(component.state().activeStepIndex).toEqual(
    getStepIndex(component.instance().wizardStepsNewVM, STORAGE_TAB_KEY)
  );
  expect(getNextButton(component).text()).toBe(createText);
  expect(component.instance().lastStepReached()).toBeFalsy();

  component.instance().onStepDataChanged(STORAGE_TAB_KEY, [{}], false); // create empty disk
  component.update();

  expect(getBackButton(component).props('disabled')).toBeTruthy();
  component.instance().onStepDataChanged(
    STORAGE_TAB_KEY,
    [
      {
        id: 1,
        name: 'D',
        size: '15',
        storageClass: 'iscsi',
        isBootable: true,
      },
      {
        id: 2,
        isBootable: false,
        attachStorage: {
          id: 'disk-two',
          name: 'disk Two',
          size: '15',
          storageClass: 'glusterfs',
        },
      },
    ],
    true
  );

  expect(createFunc).not.toHaveBeenCalled();
  getNextButton(component).simulate('click');
  component.update();

  expect(component.find(ResultTab)).toHaveLength(1);
  expect(component.state().activeStepIndex).toEqual(
    getStepIndex(component.instance().wizardStepsNewVM, RESULT_TAB_KEY)
  );
  expect(component.instance().lastStepReached()).toBeTruthy();
  expect(createFunc).toHaveBeenCalled();
  expect(getBackButton(component).props('disabled')).toBeTruthy();
  getBackButton(component).simulate('click'); // should not allow going backwards
  expect(component.find(ResultTab)).toHaveLength(1);
  expect(component.find(StorageTab)).toHaveLength(0);
};

describe('<CreateVmWizard />', () => {
  beforeEach(() => {
    createVm.mockClear();
  });

  it('renders correctly', () => {
    const component = shallow(testCreateVmWizard());
    expect(component).toMatchSnapshot();
  });

  it('is visible when mounted', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.find(WizardPattern).props().show).toBeTruthy();
  });

  it("onStepChanged doesn't update activeStepIndex due to invalid form", () => {
    createVm.mockReturnValueOnce(new Promise((resolve, reject) => resolve({ result: 'VM created' })));
    const component = shallow(testCreateVmWizard());
    expect(component.state().activeStepIndex).toEqual(0);
    component.instance().onStepChanged(1);
    expect(component.state().activeStepIndex).toEqual(0);
  });

  it('checks initial values', () => {
    const component = shallow(testCreateVmWizard());
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
    expect(component.find(WizardPattern).props().nextText).toBe('Next');
  });

  it('changes next step disability', () => {
    const component = shallow(testCreateVmWizard());

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, validBasicSettings, true);
    expect(component.state().stepData[BASIC_SETTINGS_TAB_KEY].value).toEqual(validBasicSettings);
    expect(component.state().stepData[BASIC_SETTINGS_TAB_KEY].valid).toBeTruthy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeFalsy();

    // new required field will become visible
    component.instance().onStepDataChanged(
      BASIC_SETTINGS_TAB_KEY,
      {
        ...validBasicSettings,
        [PROVISION_SOURCE_TYPE_KEY]: {
          value: 'URL',
        },
      },
      false
    );
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
  });

  it('creates vm', () => {
    createVm.mockReturnValueOnce(new Promise((resolve, reject) => resolve({ result: 'VM created' })));
    testWalkThrough();
  });

  it('fails creating the vm', () => {
    createVm.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error('VM not created'))));
    testWalkThrough();
  });

  it('reads storages from user teplate', () => {
    const component = shallow(testCreateVmWizard());

    expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(0);

    const userTemplateSource = {
      [USER_TEMPLATE_KEY]: {
        value: undefined,
      },
    };
    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, userTemplateSource, true);
    expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(0);

    let withTemplateSource = {
      ...userTemplateSource,
      [USER_TEMPLATE_KEY]: {
        value: getName(containerTemplate),
      },
    };

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, withTemplateSource, true);
    checkStorages(component, containerTemplate);

    withTemplateSource = {
      ...userTemplateSource,
      [USER_TEMPLATE_KEY]: {
        value: getName(pxeDataVolumeTemplate),
      },
    };

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, withTemplateSource, true);
    checkStorages(component, pxeDataVolumeTemplate);

    withTemplateSource = {
      ...userTemplateSource,
      [USER_TEMPLATE_KEY]: {
        value: 'unknown-template',
      },
    };

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, withTemplateSource, true);
    expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(0);
  });

  it('reads networks from user teplate', () => {
    const component = shallow(testCreateVmWizard());

    checkRootNetworkExists(component);
    const noTemplateSource = {
      [USER_TEMPLATE_KEY]: {
        value: undefined,
      },
    };
    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, noTemplateSource, true);
    checkRootNetworkExists(component);

    const podNetworkTemplateSource = {
      [USER_TEMPLATE_KEY]: {
        value: getName(containerTemplate),
      },
    };
    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, podNetworkTemplateSource, true);
    checkNetworks(component, containerTemplate);

    const multusNetworkTemplateSource = {
      [USER_TEMPLATE_KEY]: {
        value: getName(containerMultusTemplate),
      },
    };
    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, multusNetworkTemplateSource, true);
    checkNetworks(component, containerMultusTemplate);

    const noPodNetworkTemplateSource = {
      [USER_TEMPLATE_KEY]: {
        value: getName(urlNoNetworkTemplate),
      },
    };
    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, noPodNetworkTemplateSource, true);
    checkNetworks(component, urlNoNetworkTemplate);

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, noTemplateSource, true);
    checkRootNetworkExists(component);
  });
});

describe('<CreateVmWizard /> for Create VM Template', () => {
  beforeEach(() => {
    createVmTemplate.mockClear();
  });

  it('creates Vm Template', () => {
    createVmTemplate.mockReturnValueOnce(new Promise((resolve, reject) => resolve({ result: 'VM Template created' })));
    testWalkThrough(true, CREATE_VM_TEMPLATE, false, createVmTemplate);
  });
});

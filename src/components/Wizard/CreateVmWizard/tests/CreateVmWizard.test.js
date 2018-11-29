import React from 'react';
import { shallow, mount } from 'enzyme';
import { findIndex } from 'lodash';
import { WizardPattern } from 'patternfly-react';
import { CreateVmWizard } from '../CreateVmWizard';
import { Loading } from '../../../Loading';

import { validBasicSettings } from '../fixtures/BasicSettingsTab.fixture';
import { createVM } from '../../../../k8s/request';
import { CREATE_VM, NEXT } from '../strings';
import CreateVmWizardFixutre from '../fixtures/CreateVmWizard.fixture';
import BasicSettingsTab from '../BasicSettingsTab';
import { NetworksTab } from '../NetworksTab';
import StorageTab from '../StorageTab';
import ResultTab from '../ResultTab';
import {
  NETWORKS_TAB_KEY,
  BASIC_SETTINGS_TAB_KEY,
  STORAGE_TAB_KEY,
  RESULT_TAB_KEY,
  USER_TEMPLATE_KEY,
  IMAGE_SOURCE_TYPE_KEY,
} from '../constants';
import { PROVISION_SOURCE_TEMPLATE, userTemplates } from '../../../../constants';
import { getName } from '../../../../utils/selectors';
import { selectVm } from '../../../../k8s/selectors';

jest.mock('../../../../k8s/request');

const LOADING = 'loading';

const testCreateVmWizard = type => {
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
  return <CreateVmWizard {...props} />;
};

const getBackButton = component => component.find('.btn').findWhere(btn => btn.text() === 'Back');
const getNextButton = component => component.find('.btn-primary');

const getStepIndex = (steps, key) => findIndex(steps, step => step.key === key);

const checkStorages = (component, userTemplate) => {
  expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(1);
  expect(component.state('stepData')[STORAGE_TAB_KEY].value[0].templateStorage.disk).toEqual(
    selectVm(userTemplate.objects).spec.template.spec.domain.devices.disks[0]
  );
  expect(component.state('stepData')[STORAGE_TAB_KEY].value[0].templateStorage.dataVolume).toEqual(
    selectVm(userTemplate.objects).spec.dataVolumeTemplates[0]
  );
  expect(component.state('stepData')[STORAGE_TAB_KEY].value[0].templateStorage.volume).toEqual(
    selectVm(userTemplate.objects).spec.template.spec.volumes[0]
  );
};

const testWalkThrough = () => {
  const component = mount(testCreateVmWizard(LOADING));

  expect(component.find(Loading)).toHaveLength(1);
  expect(component.find(BasicSettingsTab)).toHaveLength(0);

  const namespaces = [...CreateVmWizardFixutre[0].props.namespaces];
  const templates = [...CreateVmWizardFixutre[0].props.templates];
  component.setProps({ namespaces, templates });

  expect(component.find(Loading)).toHaveLength(0);
  expect(component.find(BasicSettingsTab)).toHaveLength(1);

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
  expect(getNextButton(component).text()).toBe(CREATE_VM);
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

  expect(createVM).not.toHaveBeenCalled();
  getNextButton(component).simulate('click');
  component.update();

  expect(component.find(ResultTab)).toHaveLength(1);
  expect(component.state().activeStepIndex).toEqual(
    getStepIndex(component.instance().wizardStepsNewVM, RESULT_TAB_KEY)
  );
  expect(component.instance().lastStepReached()).toBeTruthy();
  expect(createVM).toHaveBeenCalled();
  expect(getBackButton(component).props('disabled')).toBeTruthy();
  getBackButton(component).simulate('click'); // should not allow going backwards
  expect(component.find(ResultTab)).toHaveLength(1);
  expect(component.find(StorageTab)).toHaveLength(0);
};

describe('<CreateVmWizard />', () => {
  beforeEach(() => {
    createVM.mockClear();
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
    createVM.mockReturnValueOnce(new Promise((resolve, reject) => resolve({ result: 'VM created' })));
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
        imageSourceType: {
          value: 'URL',
        },
      },
      false
    );
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeTruthy();
  });

  it('creates vm', () => {
    createVM.mockReturnValueOnce(new Promise((resolve, reject) => resolve({ result: 'VM created' })));
    testWalkThrough();
  });

  it('fails creating the vm', () => {
    createVM.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error('VM not created'))));
    testWalkThrough();
  });

  it('reads storages from user teplate', () => {
    const component = shallow(testCreateVmWizard());

    expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(0);

    const userTemplateSource = {
      [IMAGE_SOURCE_TYPE_KEY]: {
        value: PROVISION_SOURCE_TEMPLATE,
      },
    };
    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, userTemplateSource, true);
    expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(0);

    let withTemplateSource = {
      ...userTemplateSource,
      [USER_TEMPLATE_KEY]: {
        value: getName(userTemplates[0]),
      },
    };

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, withTemplateSource, true);
    checkStorages(component, userTemplates[0]);

    withTemplateSource = {
      ...userTemplateSource,
      [USER_TEMPLATE_KEY]: {
        value: getName(userTemplates[1]),
      },
    };

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, withTemplateSource, true);
    checkStorages(component, userTemplates[1]);

    withTemplateSource = {
      ...userTemplateSource,
      [USER_TEMPLATE_KEY]: {
        value: 'unknown-template',
      },
    };

    component.instance().onStepDataChanged(BASIC_SETTINGS_TAB_KEY, withTemplateSource, true);
    expect(component.state('stepData')[STORAGE_TAB_KEY].value).toHaveLength(0);
  });
});

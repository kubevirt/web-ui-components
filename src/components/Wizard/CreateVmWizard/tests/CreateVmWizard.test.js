import React from 'react';
import { shallow, mount } from 'enzyme';
import { WizardPattern } from 'patternfly-react';
import { CreateVmWizard } from '../CreateVmWizard';
import { Loading } from '../../../Loading';

import { validBasicSettings } from '../fixtures/BasicSettingsTab.fixture';
import { createVM } from '../../../../k8s/request';
import {
  BASIC_SETTINGS_TAB_IDX,
  NETWORK_TAB_IDX,
  STORAGE_TAB_IDX,
  RESULTS_TAB_IDX,
  ALL_TABS,
  CREATE_VM,
  NEXT,
} from '../constants';
import CreateVmWizardFixutre from '../fixtures/CreateVmWizard.fixture';
import BasicSettingsTab from '../BasicSettingsTab';
import { NetworksTab } from '../NetworksTab';
import StorageTab from '../StorageTab';
import ResultTab from '../ResultTab';

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

const testWalkThrough = () => {
  const component = mount(testCreateVmWizard(LOADING));

  expect(component.find(Loading)).toHaveLength(1);
  expect(component.find(BasicSettingsTab)).toHaveLength(0);

  const namespaces = [...CreateVmWizardFixutre[0].props.namespaces];
  const templates = [...CreateVmWizardFixutre[0].props.templates];
  component.setProps({ namespaces, templates });

  expect(component.find(Loading)).toHaveLength(0);
  expect(component.find(BasicSettingsTab)).toHaveLength(1);

  component.instance().onStepDataChanged(validBasicSettings, true);
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

  expect(component.state().activeStepIndex).toEqual(NETWORK_TAB_IDX);

  getBackButton(component).simulate('click');
  component.update();

  expect(component.state().activeStepIndex).toEqual(BASIC_SETTINGS_TAB_IDX);
  expect(component.find(BasicSettingsTab)).toHaveLength(1);
  expect(component.find(NetworksTab)).toHaveLength(0);

  getNextButton(component).simulate('click');
  component.update();

  expect(component.find(BasicSettingsTab)).toHaveLength(0);
  expect(component.find(NetworksTab)).toHaveLength(1);
  expect(getNextButton(component).text()).toEqual(NEXT);

  getNextButton(component).simulate('click');
  component.update();

  expect(component.state().activeStepIndex).toEqual(STORAGE_TAB_IDX);
  expect(component.find(Loading)).toHaveLength(1);
  expect(component.find(StorageTab)).toHaveLength(0);

  const persistentVolumeClaims = [...CreateVmWizardFixutre[0].props.persistentVolumeClaims];
  const storageClasses = [...CreateVmWizardFixutre[0].props.storageClasses];
  component.setProps({ persistentVolumeClaims, storageClasses });

  expect(component.find(Loading)).toHaveLength(0);
  expect(component.find(StorageTab)).toHaveLength(1);

  expect(component.state().activeStepIndex).toEqual(STORAGE_TAB_IDX);
  expect(getNextButton(component).text()).toBe(CREATE_VM);
  expect(component.instance().lastStepReached()).toBeFalsy();

  component.instance().onStepDataChanged([{}], false); // create empty disk
  component.update();

  expect(getBackButton(component).props('disabled')).toBeTruthy();
  component.instance().onStepDataChanged(
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
  expect(component.state().activeStepIndex).toEqual(RESULTS_TAB_IDX);
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
    expect(component.find(WizardPattern).props().steps).toHaveLength(ALL_TABS.length);
    expect(component.instance().getLastStepIndex()).toBe(ALL_TABS.length - 1);
  });

  it('changes next step disability', () => {
    const component = shallow(testCreateVmWizard());

    component.instance().onStepDataChanged(validBasicSettings, true);
    expect(component.state().stepData[0].value).toEqual(validBasicSettings);
    expect(component.state().stepData[0].valid).toBeTruthy();
    expect(component.find(WizardPattern).props().nextStepDisabled).toBeFalsy();

    // new required field will become visible
    component.instance().onStepDataChanged(
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
});

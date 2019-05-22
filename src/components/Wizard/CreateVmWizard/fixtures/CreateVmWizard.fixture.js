import React from 'react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { CreateVmWizard as CreateWizard } from '../CreateVmWizard';
import { networkConfigs } from '../../../../tests/mocks/networkAttachmentDefinition';
import { baseTemplates } from '../../../../k8s/objects/template';
import { userTemplates } from '../../../../tests/mocks/user_template';
import store from '../../../../tests/redux/store';
import { persistentVolumeClaims } from '../../../../tests/mocks/persistentVolumeClaim';
import { urlTemplateDataVolume } from '../../../../tests/mocks/user_template/url.mock';
import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';
import { fullVm } from '../../../../tests/mocks/vm/vm.mock';
import { callerContext } from '../../../../tests/k8s';

const vms = [cloudInitTestVm, fullVm];

export const namespaces = [
  {
    metadata: {
      name: 'default',
    },
  },
  {
    metadata: {
      name: 'myproject',
    },
  },
];

export const storageClasses = [
  {
    metadata: {
      name: 'nfs',
      namespace: 'default',
    },
  },
  {
    metadata: {
      name: 'iscsi',
      namespace: 'default',
    },
  },
  {
    metadata: {
      name: 'glusterfs',
      namespace: 'default',
    },
  },
  {
    metadata: {
      name: 'azuredisk',
      namespace: 'default',
    },
  },
];

export const units = {
  dehumanize: val => ({ value: val ? val.match(/^[0-9]+/)[0] * 1073741824 : 0 }),
  humanize: () => {
    // mock implementation
    const unit = 'Gi';
    const value = 1234;
    return {
      string: `${value} ${unit}`,
      value,
      unit,
    };
  },
};

export const wizardProps = {
  ...callerContext,
  onHide: () => {},
  userTemplates: fromJS(userTemplates),
  commonTemplates: fromJS(baseTemplates),
  namespaces: fromJS(namespaces),
  networkConfigs: fromJS(networkConfigs),
  persistentVolumeClaims: fromJS(persistentVolumeClaims),
  storageClasses: fromJS(storageClasses),
  units,
  dataVolumes: fromJS([urlTemplateDataVolume]),
  virtualMachines: fromJS(vms),
};

const CreateVmWizard = props => (
  <Provider store={store}>
    <CreateWizard {...props} />
  </Provider>
);

export default [
  {
    component: CreateVmWizard,
    name: 'namespaces',
    props: wizardProps,
  },
  {
    component: CreateVmWizard,
    name: 'selected namespace',
    props: {
      ...wizardProps,
      selectedNamespace: namespaces[0],
    },
  },
  {
    component: CreateVmWizard,
    name: 'loading',
    props: {
      ...callerContext,
      onHide: () => {},
      userTemplates: null,
      commonTemplates: null,
      namespaces: null,
      networkConfigs: null,
      persistentVolumeClaims: null,
      storageClasses: null,
      units,
      dataVolumes: null,
      virtualMachines: null,
    },
  },
  {
    component: CreateVmWizard,
    name: 'Create Vm Template',
    props: {
      ...wizardProps,
      createTemplate: true,
    },
  },
];

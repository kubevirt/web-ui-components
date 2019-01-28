import { noop } from 'patternfly-react';

import { CloneDialog } from '..';

import { k8sCreate, units, namespaces } from '../../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';

export default {
  component: CloneDialog,
  props: {
    vm: cloudInitTestVm,
    namespaces,
    persistentVolumeClaims: [],
    dataVolumes: [],
    k8sCreate,
    k8sPatch: (model, resource) => new Promise(resolve => resolve(resource)),
    units,
    onClose: noop,
    virtualMachines: [],
  },
};

import { noop } from 'patternfly-react';

import { CloneDialog } from '..';

import { units, namespaces } from '../../../Wizard/CreateVmWizard/fixtures/CreateVmWizard.fixture';
import { k8sCreate, k8sPatch } from '../../../../tests/k8s';
import { cloudInitTestVm } from '../../../../tests/mocks/vm/cloudInitTestVm.mock';

export default {
  component: CloneDialog,
  props: {
    vm: cloudInitTestVm,
    namespaces,
    persistentVolumeClaims: [],
    dataVolumes: [],
    k8sCreate,
    k8sPatch,
    units,
    onClose: noop,
    virtualMachines: [],
  },
};

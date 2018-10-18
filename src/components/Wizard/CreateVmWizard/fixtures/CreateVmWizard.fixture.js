import { CreateVmWizard } from '..';
import {
  namespaces,
  k8sCreate,
  persistentVolumeClaims,
  storageClasses,
  units
} from '../../NewVmWizard/fixtures/NewVmWizard.fixture';
import { templates, networkConfigs } from '../../../../constants';

export default [
  {
    component: CreateVmWizard,
    name: 'namespaces',
    props: {
      onHide: () => {},
      templates,
      namespaces,
      k8sCreate,
      networkConfigs,
      persistentVolumeClaims,
      storageClasses,
      units
    }
  },
  {
    component: CreateVmWizard,
    name: 'selected namespace',
    props: {
      onHide: () => {},
      templates,
      namespaces,
      selectedNamespace: namespaces[1],
      k8sCreate,
      networkConfigs,
      persistentVolumeClaims,
      storageClasses,
      units
    }
  }
];

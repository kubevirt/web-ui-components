import { CreateVmWizard } from '..';
import { namespaces, k8sCreate } from '../../NewVmWizard/fixtures/NewVmWizard.fixture';
import { templates } from '../../../../constants';

export default [
  {
    component: CreateVmWizard,
    name: 'namespaces',
    props: {
      onHide: () => {},
      templates,
      namespaces,
      k8sCreate
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
      k8sCreate
    }
  }
];

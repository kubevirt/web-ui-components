import { CreateVmWizard } from '..';
import { templates, namespaces, k8sCreate } from '../../NewVmWizard/fixtures/NewVmWizard.fixture';

export default {
  component: CreateVmWizard,
  props: {
    onHide: () => {},
    templates,
    namespaces,
    k8sCreate
  }
};

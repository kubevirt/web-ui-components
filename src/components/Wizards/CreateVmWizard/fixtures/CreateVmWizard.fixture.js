import { CreateVmWizard } from '..';
import { namespaces, k8sCreate } from '../../NewVmWizard/fixtures/NewVmWizard.fixture';
import { templates } from '../../../../constants';

export default {
  component: CreateVmWizard,
  props: {
    onHide: () => {},
    templates,
    namespaces,
    k8sCreate
  }
};

import { CreateBaremetalHostDialog } from '../CreateBaremetalHostDialog';

export default {
  component: CreateBaremetalHostDialog,
  props: {
    k8sCreate: () => {},
    onClose: () => {},
    selectedNamespace: {},
  },
};

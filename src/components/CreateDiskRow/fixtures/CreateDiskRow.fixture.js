import { CreateDiskRow } from '../CreateDiskRow';

export default {
  component: CreateDiskRow,
  props: {
    storage: {},
    onChange: () => {},
    onAccept: () => {},
    onCancel: () => {},
    storageClasses: [],
    LoadingComponent: () => null,
  },
};

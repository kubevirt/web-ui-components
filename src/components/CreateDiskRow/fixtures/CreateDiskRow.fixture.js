import { CreateDiskRow } from '..';

export default {
  component: CreateDiskRow,
  props: {
    storage: {},
    onChange: () => {},
    onAccept: () => {},
    onCancel: () => {},
    storageClasses: [],
    LoadingComponent: () => {},
  },
};

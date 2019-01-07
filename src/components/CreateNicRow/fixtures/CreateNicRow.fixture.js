import { CreateNicRow } from '..';

export default {
  component: CreateNicRow,
  props: {
    nic: {},
    onChange: () => {},
    onAccept: () => {},
    onCancel: () => {},
    networks: [],
  },
};

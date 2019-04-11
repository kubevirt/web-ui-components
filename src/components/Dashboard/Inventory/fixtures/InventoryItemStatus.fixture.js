import { InventoryItemStatus } from '../InventoryItemStatus';

export default [
  {
    component: InventoryItemStatus,
    props: {
      ok: 5,
      warn: 3,
      error: 2,
      inProgress: 1,
      off: 3,
    },
  },
  {
    name: 'ok',
    component: InventoryItemStatus,
    props: {
      ok: 1,
      warn: 0,
      error: 0,
      inProgress: 0,
      off: 0,
    },
  },
];

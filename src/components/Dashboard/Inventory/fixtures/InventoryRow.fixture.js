import { InventoryRow } from '../InventoryRow';
import statusFixtures from './InventoryItemStatus.fixture';

export default [
  {
    component: InventoryRow,
    props: {
      title: 'PVCs',
      count: 5,
      ...statusFixtures[0].props,
    },
  },
  {
    component: InventoryRow,
    name: 'Loading inventory row',
    props: {
      title: 'PVCs',
    },
  },
];

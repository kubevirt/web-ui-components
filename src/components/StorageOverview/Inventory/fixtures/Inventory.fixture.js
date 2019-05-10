import { Inventory } from '../Inventory';
import { nodes, pvcs, pvs, diskStats } from '../../fixtures/StorageOverview.fixture';

export default [
  {
    component: Inventory,
    name: 'Inventory',
    props: {
      nodes,
      pvcs,
      pvs,
      diskStats,
    },
  },
  {
    name: 'loading',
    component: Inventory,
    props: {},
  },
];

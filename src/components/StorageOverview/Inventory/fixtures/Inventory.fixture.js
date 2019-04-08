import { Inventory } from '../Inventory';
import { nodes, pvcs, pvs } from '../../fixtures/StorageOverview.fixture';

export default [
  {
    component: Inventory,
    props: {
      nodes,
      pvcs,
      pvs,
    },
  },
  {
    name: 'loading',
    component: Inventory,
    props: {},
  },
];

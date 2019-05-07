import { Inventory } from '../Inventory';
import { nodes, pvcs, pvs } from '../../fixtures/StorageOverview.fixture';
import { osdDisksCount } from '../../../../tests/mocks/disks';

export default [
  {
    component: Inventory,
    name: 'Inventory',
    props: {
      nodes,
      pvcs,
      pvs,
      ...osdDisksCount,
    },
  },
  {
    name: 'loading',
    component: Inventory,
    props: {},
  },
];

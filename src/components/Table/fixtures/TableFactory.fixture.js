import { noop } from 'patternfly-react';

import { TableFactory } from '../TableFactory';
import { rows, columns } from './EditableDraggableTable.fixture';

const actionButtons = [
  {
    id: 'first',
    text: 'First Button',
  },
  {
    id: 'second',
    text: 'Second Button',
  },
];

export default [
  {
    component: TableFactory,
    props: {
      actionButtons,
      onRowUpdate: noop,
      onRowDeleteOrMove: noop,
      onRowActivate: noop,
      columns,
      rows,
    },
  },
];

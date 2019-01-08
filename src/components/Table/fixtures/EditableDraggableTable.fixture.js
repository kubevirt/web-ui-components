import { default as EditableDraggableTable } from '../EditableDraggableTable';

export const rows = [
  {
    id: 1,
    one: 'Cell 1-one',
    two: 'Cell 1-two',
  },
  {
    id: 2,
    one: 'Cell 2-one',
    two: 'Cell 2-two',
  },
];

export const columns = [
  {
    header: {
      label: 'One',
    },
    property: 'one',
  },
  {
    header: {
      label: 'Two',
    },
    property: 'two',
  },
];

export default [
  {
    component: EditableDraggableTable,
    props: {
      rows,
      columns,
      onChange: () => {},
    },
  },
];

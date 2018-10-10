import EditableDraggableTable from '../EditableDraggableTable';

export const rows = [
  {
    id: 1,
    one: 'First Column',
    two: 'Second Column'
  },
  {
    id: 2,
    one: 'F Column',
    two: 'S Column'
  }
];

export const columns = [
  {
    header: {
      label: 'One'
    },
    property: 'one'
  },
  {
    header: {
      label: 'Two'
    },
    property: 'two'
  }
];

export default [
  {
    component: EditableDraggableTable,
    props: {
      rows,
      columns,
      onChange: () => {}
    }
  }
];

import React from 'react';
import { shallow, mount } from 'enzyme';
import { rows, columns } from '../fixtures/EditableDraggableTable.fixture';
import EditableDraggableTable from '../EditableDraggableTable';

const testEditableDraggableTable = (rowsArg = [], onChange = null) => (
  <EditableDraggableTable columns={columns} rows={rowsArg} onChange={onChange || jest.fn()} />
);

describe('<EditableDraggableTable />', () => {
  it('renders correctly', () => {
    const component = shallow(testEditableDraggableTable());
    expect(component).toMatchSnapshot();
  });

  it('renders data correctly', () => {
    const component = shallow(testEditableDraggableTable(rows));
    expect(component).toMatchSnapshot();
  });

  it('creates new row', () => {
    const onChange = jest.fn();
    const component = mount(testEditableDraggableTable(rows, onChange));

    component.setProps({
      onChange,
      rows: [
        ...rows,
        {
          id: 3,
          edit: true,
          one: 'F3 Column',
          two: 'S3 Column'
        }
      ]
    });
    expect(onChange).toHaveBeenCalled();
  });
});

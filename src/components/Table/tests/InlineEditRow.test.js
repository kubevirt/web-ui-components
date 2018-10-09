import React from 'react';
import { shallow } from 'enzyme';
import { Table } from 'patternfly-react';
import InlineEditRow from '../InlineEditRow';

const testProp = 'testProp';

const testInlineEditRow = () => <InlineEditRow testProp={testProp} />;

describe('<EditableDraggableTable />', () => {
  it('renders correctly', () => {
    const component = shallow(testInlineEditRow());
    expect(component).toMatchSnapshot();
  });

  it('passes props', () => {
    const component = shallow(testInlineEditRow());
    expect(component.find(Table.InlineEditRow).props().testProp).toBe(testProp);
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import { TableFactory } from '../TableFactory';

const noop = () => {};
const testTableFactory = () => (
  <TableFactory
    onRowUpdate={noop}
    onRowActivate={noop}
    onRowDeleteOrMove={noop}
    error=""
    columns={[]}
    rows={[]}
    actionButtons={[]}
  />
);

describe('<TableFactory />', () => {
  it('renders correctly', () => {
    const component = shallow(testTableFactory());
    expect(component).toMatchSnapshot();
  });
});

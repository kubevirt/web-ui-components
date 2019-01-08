import React from 'react';
import { noop } from 'patternfly-react';
import { shallow } from 'enzyme';

import { TableFactory } from '../TableFactory';

const testTableFactory = () => (
  <TableFactory onRowUpdate={noop} onRowActivate={noop} onRowDeleteOrMove={noop} columns={[]} rows={[]} />
);

describe('<TableFactory />', () => {
  it('renders correctly', () => {
    const component = shallow(testTableFactory());
    expect(component).toMatchSnapshot();
  });
});

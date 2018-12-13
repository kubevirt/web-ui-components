import React from 'react';
import { shallow } from 'enzyme';

import CreateDiskRowFixture from '../fixtures/CreateDiskRow.fixture';
import { CreateDiskRow } from '../CreateDiskRow';

const testCreateDiskRow = () => <CreateDiskRow {...CreateDiskRowFixture.props} />;

describe('<CreateDiskRow />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateDiskRow());
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import { CreateDiskRow } from '..';
import CreateDiskRowFixture from '../fixtures/CreateDiskRow.fixture';

const testCreateDiskRow = () => <CreateDiskRow {...CreateDiskRowFixture.props} />;

describe('<CreateDiskRow />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateDiskRow());
    expect(component).toMatchSnapshot();
  });
});

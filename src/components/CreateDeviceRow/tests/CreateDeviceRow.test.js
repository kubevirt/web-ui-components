import React from 'react';
import { shallow } from 'enzyme';

import { default as CreateDeviceRowFixture } from '../fixtures/CreateDeviceRow.fixture';

import { CreateDeviceRow } from '..';

const testCreateDeviceRow = () => <CreateDeviceRow {...CreateDeviceRowFixture.props} />;

describe('<CreateDeviceRow />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateDeviceRow());
    expect(component).toMatchSnapshot();
  });
});

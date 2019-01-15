import React from 'react';
import { shallow } from 'enzyme';

import { CreateDeviceRow } from '..';

import { default as CreateDeviceRowFixture } from '../fixtures/CreateDeviceRow.fixture';

const testCreateDeviceRow = () => <CreateDeviceRow {...CreateDeviceRowFixture.props} />;

describe('<CreateDeviceRow />', () => {
  it('renders correctly', () => {
    const component = shallow(testCreateDeviceRow());
    expect(component).toMatchSnapshot();
  });
});

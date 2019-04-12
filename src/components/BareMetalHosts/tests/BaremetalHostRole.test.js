import React from 'react';
import { shallow } from 'enzyme';

import { BaremetalHostRole } from '..';

import BaremetalHostRoleFixture from '../fixtures/BaremetalHostRole.fixture';

const testBaremetalHostRole = () => <BaremetalHostRole {...BaremetalHostRoleFixture[0].props} />;

describe('<BaremetalHostRole />', () => {
  it('renders a role for host', () => {
    const component = shallow(testBaremetalHostRole());
    expect(component).toMatchSnapshot();
  });
});

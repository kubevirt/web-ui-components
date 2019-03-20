import React from 'react';
import { shallow } from 'enzyme';

import { BaremetalHostStatus } from '..';

import BaremetalHostStatusFixture from '../fixtures/BaremetalHostStatus.fixture';

const testBaremetalHostStatus = () => <BaremetalHostStatus {...BaremetalHostStatusFixture[0].props} />;
const testBaremetalHostStatusSuccess = () => <BaremetalHostStatus {...BaremetalHostStatusFixture[1].props} />;

describe('<BaremetalHostStatus />', () => {
  it('renders a generic status message', () => {
    const component = shallow(testBaremetalHostStatus());
    expect(component).toMatchSnapshot();
  });
  it('renders a generic success message', () => {
    const component = shallow(testBaremetalHostStatusSuccess());
    expect(component).toMatchSnapshot();
  });
});

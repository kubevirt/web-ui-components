import React from 'react';
import { shallow } from 'enzyme';

import { Flavor } from '..';

import { default as FlavorFixture } from '../fixtures/Flavor.fixture';

const testFlavor = () => <Flavor {...FlavorFixture[0].props} id="myflavor" />;

describe('<Flavor />', () => {
  it('renders correctly', () => {
    const component = shallow(testFlavor());
    expect(component).toMatchSnapshot();
  });
});

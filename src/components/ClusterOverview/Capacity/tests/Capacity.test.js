import React from 'react';
import { shallow } from 'enzyme';

import { Capacity } from '../Capacity';
import { default as CapacityFixtures } from '../fixtures/Capacity.fixture';

const testCapacityOverview = () => <Capacity {...CapacityFixtures.props} />;

describe('<Capacity />', () => {
  it('renders correctly', () => {
    const component = shallow(testCapacityOverview());
    expect(component).toMatchSnapshot();
  });
});

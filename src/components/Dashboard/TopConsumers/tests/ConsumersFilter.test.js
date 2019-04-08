import React from 'react';
import { shallow } from 'enzyme';

import { ConsumersFilter } from '../ConsumersFilter';
import { default as ConsumersFilterFixtures } from '../fixtures/ConsumersFilter.fixture';

const testConsumersFilter = () => <ConsumersFilter {...ConsumersFilterFixtures.props} />;

describe('<ConsumersFilter />', () => {
  it('renders correctly', () => {
    const component = shallow(testConsumersFilter());
    expect(component).toMatchSnapshot();
  });
});

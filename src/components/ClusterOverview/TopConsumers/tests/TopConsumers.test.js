import React from 'react';
import { shallow } from 'enzyme';

import TopConsumers from '../TopConsumers';
import { default as ConsumersFixtures } from '../fixtures/TopConsumers.fixture';

const testTopConsumersOverview = () => <TopConsumers {...ConsumersFixtures.props} />;

describe('<TopConsumers />', () => {
  it('renders correctly', () => {
    const component = shallow(testTopConsumersOverview());
    expect(component).toMatchSnapshot();
  });
});

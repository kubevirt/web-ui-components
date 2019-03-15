import React from 'react';
import { render } from 'enzyme';

import { TopConsumers } from '../TopConsumers';
import { default as ConsumersFixtures } from '../fixtures/TopConsumers.fixture';

const testTopConsumersOverview = () => <TopConsumers {...ConsumersFixtures.props} />;

describe('<TopConsumers />', () => {
  it('renders correctly', () => {
    const component = render(testTopConsumersOverview());
    expect(component).toMatchSnapshot();
  });
});

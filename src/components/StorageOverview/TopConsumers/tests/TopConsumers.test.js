import React from 'react';
import { render } from 'enzyme';

import { TopConsumers } from '../TopConsumers';
import { TopConsumerStats } from '../fixtures/TopConsumers.fixture';

const testTopConsumersOverview = () => <TopConsumers {...TopConsumerStats} />;

describe('<TopConsumers />', () => {
  it('renders correctly', () => {
    const component = render(testTopConsumersOverview());
    expect(component).toMatchSnapshot();
  });
});

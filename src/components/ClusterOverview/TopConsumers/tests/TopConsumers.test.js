import React from 'react';
import { render } from 'enzyme';

import { TopConsumers } from '../TopConsumers';
import { consumersData } from '../fixtures/TopConsumers.fixture';

const testTopConsumersOverview = () => <TopConsumers {...consumersData} />;

describe('<TopConsumers />', () => {
  it('renders correctly', () => {
    const component = render(testTopConsumersOverview());
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { render } from 'enzyme';

import { TopConsumers } from '../TopConsumers';
import { TopConsumerStats } from '../fixtures/TopConsumers.fixture';

describe('<TopConsumers />', () => {
  it('no-data-renders-correctly', () => {
    const component = render(<TopConsumers {...TopConsumerStats[0]} />);
    expect(component).toMatchSnapshot();
  });
  it('data-renders-correctly', () => {
    const component = render(<TopConsumers {...TopConsumerStats[1]} />);
    expect(component).toMatchSnapshot();
  });
  it('render-correctly-on-loading', () => {
    const component = render(<TopConsumers />);
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { render } from 'enzyme';

import { TopConsumers } from '../TopConsumers';
import { TopConsumerStats } from '../fixtures/TopConsumers.fixture';

/* eslint no-global-assign: 0 */
describe('<TopConsumers />', () => {
  it('no-data-renders-correctly', () => {
    const component = render(<TopConsumers {...TopConsumerStats[0]} />);
    expect(component).toMatchSnapshot();
  });
  it('data-renders-correctly', () => {
    // mocked the new Date response
    const mockedDate = new Date('2018-02-28T09:39:59');
    const originalDate = Date;

    // overwritten the Date funtion
    global.Date = jest.fn(() => mockedDate);
    const component = render(<TopConsumers {...TopConsumerStats[1]} />);
    expect(component).toMatchSnapshot({});

    // restored the original date function
    global.Date.setDate = originalDate.setDate;
  });
  it('render-correctly-on-loading', () => {
    const component = render(<TopConsumers />);
    expect(component).toMatchSnapshot();
  });
});
/* eslint no-global-assign: 1 */

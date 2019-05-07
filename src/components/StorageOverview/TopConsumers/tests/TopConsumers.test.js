import React from 'react';
import { shallow } from 'enzyme';

import { TopConsumers } from '../TopConsumers';
import { topConsumers, emptyTopConsumers } from '../fixtures/TopConsumers.fixture';

describe('<TopConsumers />', () => {
  it('no-data-renders-correctly', () => {
    const component = shallow(<TopConsumers topConsumers={emptyTopConsumers} />);
    expect(component).toMatchSnapshot();
  });
  it('data-renders-correctly', () => {
    const component = shallow(<TopConsumers topConsumers={topConsumers} />);
    expect(component).toMatchSnapshot({});
  });
  it('render-correctly-on-loading', () => {
    const component = shallow(<TopConsumers />);
    expect(component).toMatchSnapshot();
  });
});

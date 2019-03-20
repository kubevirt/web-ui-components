import React from 'react';
import { shallow } from 'enzyme';

import { ConsumerItem } from '../ConsumerItem';
import { default as ConsumerItemFixtures } from '../fixtures/ConsumerItem.fixture';

const testConsumerItem = () => <ConsumerItem {...ConsumerItemFixtures.props} />;

describe('<ConsumerItem />', () => {
  it('renders correctly', () => {
    const component = shallow(testConsumerItem());
    expect(component).toMatchSnapshot();
  });
});

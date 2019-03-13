import React from 'react';
import { shallow } from 'enzyme';

import { Consumers } from '../Consumers';
import { default as ConsumersFixtures } from '../fixtures/Consumers.fixture';

const testConsumersOverview = () => <Consumers {...ConsumersFixtures.props} />;

describe('<Consumers />', () => {
  it('renders correctly', () => {
    const component = shallow(testConsumersOverview());
    expect(component).toMatchSnapshot();
  });
});

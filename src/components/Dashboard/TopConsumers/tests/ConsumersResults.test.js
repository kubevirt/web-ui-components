import React from 'react';
import { shallow } from 'enzyme';

import { ConsumersResults } from '../ConsumersResults';
import { default as ConsumersResultsFixtures } from '../fixtures/ConsumersResults.fixture';

const testConsumersResults = () => <ConsumersResults {...ConsumersResultsFixtures.props} />;

describe('<ConsumersResults />', () => {
  it('renders correctly', () => {
    const component = shallow(testConsumersResults());
    expect(component).toMatchSnapshot();
  });
});

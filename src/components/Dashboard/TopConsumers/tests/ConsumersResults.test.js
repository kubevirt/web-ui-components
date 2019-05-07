import React from 'react';
import { shallow } from 'enzyme';

import { ConsumersResults } from '../ConsumersResults';
import { default as ConsumersResultsFixtures } from '../fixtures/ConsumersResults.fixture';

// eslint-disable-next-line react/prop-types
const testConsumersResults = ({ props }) => <ConsumersResults {...props} />;

describe('<ConsumersResults />', () => {
  ConsumersResultsFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testConsumersResults(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

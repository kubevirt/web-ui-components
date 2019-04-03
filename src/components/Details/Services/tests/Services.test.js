import React from 'react';
import { shallow } from 'enzyme';

import { Services } from '../Services';

import { default as servicesFixtures } from '../fixtures/Services.fixture';

// eslint-disable-next-line react/prop-types
const testServices = ({ props }) => <Services {...props} />;

describe('<Services />', () => {
  it('renders correctly', () => {
    servicesFixtures.forEach(fixture => {
      const component = shallow(testServices(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

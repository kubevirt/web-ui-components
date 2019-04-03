import React from 'react';
import { shallow } from 'enzyme';

import { CapacityItem } from '../CapacityItem';
import { default as CapacityItemFixtures } from '../fixtures/CapacityItem.fixture';

// eslint-disable-next-line react/prop-types
const testCapacityItem = ({ props }) => <CapacityItem {...props} />;

describe('<CapacityItem />', () => {
  it('renders correctly', () => {
    CapacityItemFixtures.forEach(fixture => {
      const component = shallow(testCapacityItem(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

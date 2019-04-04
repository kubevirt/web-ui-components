import React from 'react';
import { shallow } from 'enzyme';

import { UtilizationItem } from '../UtilizationItem';
import { default as UtilizationItemFixtures } from '../fixtures/UtilizationItem.fixture';

// eslint-disable-next-line react/prop-types
const testItem = ({ props }) => <UtilizationItem {...props} />;

describe('<UtilizationItem />', () => {
  it('renders correctly', () => {
    UtilizationItemFixtures.forEach(fixture => {
      const component = shallow(testItem(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

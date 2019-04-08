import React from 'react';
import { render } from 'enzyme';

import { UtilizationItem } from '../UtilizationItem';
import { default as UtilizationItemFixtures } from '../fixtures/UtilizationItem.fixture';

// eslint-disable-next-line react/prop-types
const testItem = ({ props }) => <UtilizationItem {...props} />;

describe('<UtilizationItem />', () => {
  it('renders correctly', () => {
    UtilizationItemFixtures.forEach(fixture => {
      const component = render(testItem(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

import React from 'react';
import { shallow } from 'enzyme';

import { AlertItem } from '../AlertItem';
import { default as AlertItemFixtures } from '../fixtures/AlertItem.fixture';

// eslint-disable-next-line react/prop-types
const testAlertItem = ({ props }) => <AlertItem {...props} />;

describe('<AlertItem />', () => {
  AlertItemFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testAlertItem(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

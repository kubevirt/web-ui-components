import React from 'react';
import { render } from 'enzyme';

import { DetailItem } from '../DetailItem';
import { default as DetailItemFixtures } from '../fixtures/DetailItem.fixture';

// eslint-disable-next-line react/prop-types
const testDetailItem = ({ props }) => <DetailItem {...props} />;

describe('<DetailItem />', () => {
  DetailItemFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = render(testDetailItem(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

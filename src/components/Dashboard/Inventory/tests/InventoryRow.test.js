import React from 'react';
import { render } from 'enzyme';

import { InventoryRow } from '../InventoryRow';
import { default as InventoryRowFixtures } from '../fixtures/InventoryRow.fixture';

// eslint-disable-next-line react/prop-types
const testInventoryRow = ({ props }) => <InventoryRow {...props} />;

describe('<InventoryRow />', () => {
  InventoryRowFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = render(testInventoryRow(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

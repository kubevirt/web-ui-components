import React from 'react';
import { render } from 'enzyme';

import { InventoryRow } from '../InventoryRow';
import { default as InventoryRowFixtures } from '../fixtures/InventoryRow.fixture';

const testInventoryRow = () => <InventoryRow {...InventoryRowFixtures[0].props} />;

describe('<InventoryRow />', () => {
  it('renders correctly', () => {
    const component = render(testInventoryRow());
    expect(component).toMatchSnapshot();
  });
});

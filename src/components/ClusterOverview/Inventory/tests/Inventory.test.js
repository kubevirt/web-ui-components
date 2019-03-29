import React from 'react';
import { render } from 'enzyme';

import { Inventory } from '../Inventory';
import { default as InventoryFixtures } from '../fixtures/Inventory.fixture';

const testInventoryOverview = () => <Inventory {...InventoryFixtures[0].props} />;

describe('<Inventory />', () => {
  it('renders correctly', () => {
    const component = render(testInventoryOverview());
    expect(component).toMatchSnapshot();
  });
});

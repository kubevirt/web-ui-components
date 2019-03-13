import React from 'react';
import { shallow } from 'enzyme';

import { Inventory } from '../Inventory';
import { default as InventoryFixtures } from '../fixtures/Inventory.fixture';

const testInventoryOverview = () => <Inventory {...InventoryFixtures.props} />;

describe('<Inventory />', () => {
  it('renders correctly', () => {
    const component = shallow(testInventoryOverview());
    expect(component).toMatchSnapshot();
  });
});

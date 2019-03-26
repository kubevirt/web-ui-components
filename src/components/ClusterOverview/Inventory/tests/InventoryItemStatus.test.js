import React from 'react';
import { render } from 'enzyme';

import { InventoryItemStatus } from '../InventoryItemStatus';
import { default as InventoryItemStatusFixtures } from '../fixtures/InventoryItemStatus.fixture';

const testInventoryItemStatusOverview = () => <InventoryItemStatus {...InventoryItemStatusFixtures[0].props} />;

describe('<InventoryItemStatus />', () => {
  it('renders correctly', () => {
    const component = render(testInventoryItemStatusOverview());
    expect(component).toMatchSnapshot();
  });
});

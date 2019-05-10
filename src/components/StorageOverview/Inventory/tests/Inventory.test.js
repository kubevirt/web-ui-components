import React from 'react';
import { render, shallow } from 'enzyme';

import { Inventory, InventoryConnected } from '../Inventory';
import { default as InventoryFixtures } from '../fixtures/Inventory.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';

// eslint-disable-next-line react/prop-types
const testInventoryOverview = ({ props }) => <Inventory {...props} />;

describe('<Inventory />', () => {
  InventoryFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testInventoryOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={StorageOverviewFixtures[0].props}>
        <InventoryConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

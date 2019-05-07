import React from 'react';
import { shallow, render } from 'enzyme';

import { Inventory, InventoryConnected } from '../Inventory';
import { default as InventoryFixtures } from '../fixtures/Inventory.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';

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
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[0].props}>
        <InventoryConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

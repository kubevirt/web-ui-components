import React from 'react';
import { render, shallow } from 'enzyme';

import { StorageDetails, StorageDetailsConnected } from '../Details';
import { default as StorageDetailsFixtures } from '../fixtures/Details.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';

// eslint-disable-next-line react/prop-types
const testDetailsOverview = ({ props }) => <StorageDetails {...props} />;

describe('<StorageDetails />', () => {
  StorageDetailsFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testDetailsOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={StorageOverviewFixtures[0].props}>
        <StorageDetailsConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

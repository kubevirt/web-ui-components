import React from 'react';
import { render, shallow } from 'enzyme';

import { OCSHealth, OCSHealthConnected } from '../Health';
import { default as HealthFixtures } from '../fixtures/Health.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';

// eslint-disable-next-line react/prop-types
const testOCSHealthOverview = ({ props }) => <OCSHealth {...props} />;

describe('<OCSHealth />', () => {
  HealthFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testOCSHealthOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={StorageOverviewFixtures[0].props}>
        <OCSHealthConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

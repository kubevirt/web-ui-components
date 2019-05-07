import React from 'react';
import { render, shallow } from 'enzyme';

import { Health, HealthConnected } from '../Health';
import { default as HealthFixtures } from '../fixtures/Health.fixture';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';

// eslint-disable-next-line react/prop-types
const testHealthOverview = ({ props }) => <Health {...props} />;

describe('<Health />', () => {
  HealthFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testHealthOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[0].props}>
        <HealthConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

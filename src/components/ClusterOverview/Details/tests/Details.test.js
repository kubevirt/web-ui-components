import React from 'react';
import { shallow, render } from 'enzyme';

import { Details, DetailsConnected } from '../Details';
import { default as DetailsFixtures } from '../fixtures/Details.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';

// eslint-disable-next-line react/prop-types
const testDetailsOverview = ({ props }) => <Details {...props} />;

describe('<Details />', () => {
  DetailsFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testDetailsOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[0].props}>
        <DetailsConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

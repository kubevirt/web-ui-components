import React from 'react';
import { shallow } from 'enzyme';

import { ClusterOverview } from '..';

import { default as ClusterOverviewFixtures } from '../fixtures/ClusterOverview.fixture';

const testClusterOverview = () => <ClusterOverview {...ClusterOverviewFixtures[0].props} />;

describe('<ClusterOverview />', () => {
  it('renders correctly', () => {
    const component = shallow(testClusterOverview());
    expect(component).toMatchSnapshot();
  });
});

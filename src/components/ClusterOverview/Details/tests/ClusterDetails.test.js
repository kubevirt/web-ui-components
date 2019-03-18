import React from 'react';
import { render } from 'enzyme';

import { ClusterDetails } from '../ClusterDetails';
import { default as ClusterDetailsFixtures } from '../fixtures/ClusterDetails.fixture';

const testClusterDetailsOverview = () => <ClusterDetails {...ClusterDetailsFixtures[0].props} />;

describe('<ClusterDetails />', () => {
  it('renders correctly', () => {
    const component = render(testClusterDetailsOverview());
    expect(component).toMatchSnapshot();
  });
});

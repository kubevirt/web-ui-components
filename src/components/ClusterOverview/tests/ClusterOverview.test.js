import React from 'react';
import { shallow, render } from 'enzyme';

import { ClusterOverview } from '..';

import { ClusterOverviewContext } from '../ClusterOverviewContext';

import { default as ClusterOverviewFixtures } from '../fixtures/ClusterOverview.fixture';

const providerValue = ClusterOverviewFixtures[0].props;

describe('<ClusterOverview />', () => {
  it('shallow-renders correctly', () => {
    const component = shallow(<ClusterOverview />);
    expect(component).toMatchSnapshot();
  });

  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={providerValue}>
        <ClusterOverview />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

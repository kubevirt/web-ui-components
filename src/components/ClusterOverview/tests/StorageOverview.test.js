import React from 'react';
import { shallow, render } from 'enzyme';

import { StorageOverview } from '..';

import { ClusterOverviewContext } from '../ClusterOverviewContext';

import { default as StorageOverviewFixtures } from '../fixtures/StorageOverview.fixture';

const providerValue = StorageOverviewFixtures[0].props;

describe('<StorageOverview />', () => {
  it('shallow-renders correctly', () => {
    const component = shallow(<StorageOverview />);
    expect(component).toMatchSnapshot();
  });

  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={providerValue}>
        <StorageOverview />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

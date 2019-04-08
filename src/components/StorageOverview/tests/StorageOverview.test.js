import React from 'react';
import { shallow, render } from 'enzyme';

import { StorageOverview } from '..';

import { StorageOverviewContext } from '../StorageOverviewContext';

import { default as StorageOverviewFixtures } from '../fixtures/StorageOverview.fixture';

const providerValue = StorageOverviewFixtures[0].props;

describe('<StorageOverview />', () => {
  it('shallow-renders correctly', () => {
    const component = shallow(<StorageOverview />);
    expect(component).toMatchSnapshot();
  });

  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={providerValue}>
        <StorageOverview />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

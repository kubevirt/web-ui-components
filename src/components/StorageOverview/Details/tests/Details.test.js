import React from 'react';
import { render } from 'enzyme';

import { StorageDetails } from '../Details';
import { default as DetailsFixtures } from '../fixtures/Details.fixture';

const testDetailsOverview = () => <StorageDetails {...DetailsFixtures[0].props} />;

describe('<Details />', () => {
  it('renders correctly', () => {
    const component = render(testDetailsOverview());
    expect(component).toMatchSnapshot();
  });
});

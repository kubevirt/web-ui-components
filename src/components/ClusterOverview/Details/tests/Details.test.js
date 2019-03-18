import React from 'react';
import { render } from 'enzyme';

import { Details } from '../Details';
import { default as DetailsFixtures } from '../fixtures/Details.fixture';

const testDetailsOverview = () => <Details {...DetailsFixtures.props} />;

describe('<Details />', () => {
  it('renders correctly', () => {
    const component = render(testDetailsOverview());
    expect(component).toMatchSnapshot();
  });
});

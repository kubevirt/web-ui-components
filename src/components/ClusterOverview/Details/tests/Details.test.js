import React from 'react';
import { shallow } from 'enzyme';

import Details from '../Details';
import { default as DetailsFixtures } from '../fixtures/Details.fixture';

const testDetailsOverview = () => <Details {...DetailsFixtures.props} />;

describe('<Details />', () => {
  it('renders correctly', () => {
    const component = shallow(testDetailsOverview());
    expect(component).toMatchSnapshot();
  });
});

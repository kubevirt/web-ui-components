import React from 'react';
import { shallow } from 'enzyme';

import { default as DescriptionFixture } from '../fixtures/Description.fixture';

import { Description } from '..';

const testDescription = () => <Description {...DescriptionFixture[0].props} id="description" />;

describe('<Description />', () => {
  it('renders correctly', () => {
    const component = shallow(testDescription());
    expect(component).toMatchSnapshot();
  });
});

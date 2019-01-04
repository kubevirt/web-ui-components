import React from 'react';
import { shallow } from 'enzyme';

import { Description } from '..';

import { default as DescriptionFixture } from '../fixtures/Description.fixture';

const testDescription = () => <Description {...DescriptionFixture[0].props} />;

describe('<Description />', () => {
  it('renders correctly', () => {
    const component = shallow(testDescription());
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { mount } from 'enzyme';

import { default as urlFixtures } from '../fixtures/Url.fixture';

import { Url } from '..';

// eslint-disable-next-line react/prop-types
const testUrl = ({ props }) => <Url {...props} />;

describe('<Url />', () => {
  it('renders correctly', () => {
    urlFixtures.forEach(fixture => {
      const component = mount(testUrl(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

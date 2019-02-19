import React from 'react';
import { mount } from 'enzyme';

import { Url } from '..';

import { default as urlFixtures } from '../fixtures/Url.fixture';

const testUrl = ({ props }) => <Url {...props} />;

describe('<Url />', () => {
  it('renders correctly', () => {
    urlFixtures.forEach(fixture => {
      const component = mount(testUrl(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

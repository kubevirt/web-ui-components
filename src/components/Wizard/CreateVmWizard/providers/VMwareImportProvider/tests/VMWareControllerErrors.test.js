import React from 'react';
import { render } from 'enzyme';

import VMWareControllerErrors from '../VMWareControllerErrors';
import errorFixtures from '../fixtures/VMWareControllerErrors.fixture';

describe('<VMWareControllerErrors />', () => {
  errorFixtures.forEach((fixture, idx) => {
    const { props, name } = fixture;
    it(`renders correctly ${name || idx}`, () => {
      expect(render(<VMWareControllerErrors {...props} />)).toMatchSnapshot();
    });
  });
});

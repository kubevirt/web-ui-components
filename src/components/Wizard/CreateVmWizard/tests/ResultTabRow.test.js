import React from 'react';
import { shallow } from 'enzyme';

import { ResultTabRow } from '../ResultTabRow';
import { default as resultTabRowFixtures } from '../fixtures/ResultTabRow.fixture';

// eslint-disable-next-line react/prop-types
const testResultTab = ({ props }) => <ResultTabRow {...props} />;

describe('<ResultTabRow />', () => {
  it('renders correctly', () => {
    resultTabRowFixtures.forEach(fixture => {
      const component = shallow(testResultTab(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

import React from 'react';
import { shallow } from 'enzyme';

import { ResultTab } from '../ResultTab';
import { default as resultTabFixtures } from '../fixtures/ResultTab.fixture';

// eslint-disable-next-line react/prop-types
const testResultTab = ({ props }) => <ResultTab {...props} />;

describe('<ResultTab />', () => {
  it('renders correctly', () => {
    resultTabFixtures.forEach(fixture => {
      const component = shallow(testResultTab(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

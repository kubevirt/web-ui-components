import React from 'react';
import { shallow } from 'enzyme';

import { Status } from '../Status';
import StatusFixtures from '../fixtures/Status.fixture';

const testStatus = () => <Status {...StatusFixtures[0].props} />;

describe('<Status />', () => {
  it('renders correctly', () => {
    const component = shallow(testStatus());
    expect(component).toMatchSnapshot();
  });
});

describe('<StatusField>', () => {
  for (let i = 1; i < StatusFixtures.length; i++) {
    it('renders correctly', () => {
      const component = shallow(<Status {...StatusFixtures[i].props} />);
      expect(component).toMatchSnapshot();
    });
  }
});

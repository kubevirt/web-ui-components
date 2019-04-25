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

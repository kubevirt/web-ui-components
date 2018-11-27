import React from 'react';
import { shallow } from 'enzyme';

import SerialConsoleConnector from '../SerialConsoleConnector';
import { dummyFixture } from '../fixtures/SerialConsoleConnector.fixture';

describe('<SerialConsoleConnector />', () => {
  it('renders correctly - dummy shallow test only', () => {
    const component = shallow(<SerialConsoleConnector {...dummyFixture} />);
    expect(component).toMatchSnapshot();
  });
});

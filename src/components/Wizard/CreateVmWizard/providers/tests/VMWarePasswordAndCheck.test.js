// TODO: implement more tests
import React from 'react';
import { shallow } from 'enzyme';

import VMWarePasswordAndCheck from '../VMWarePasswordAndCheck';
import fixture from '../fixtures/VMWarePasswordAndCheck.fixture';

const testComponent = () => <VMWarePasswordAndCheck {...fixture.props} />;

describe('<VMWarePasswordAndCheck />', () => {
  it('renders correctly', () => {
    const component = shallow(testComponent());
    expect(component).toMatchSnapshot();
  });
});

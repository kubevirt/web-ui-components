// TODO: implement more tests
import React from 'react';
import { mount } from 'enzyme';

import VMWarePasswordAndCheck from '../VMWarePasswordAndCheck';
import fixture from '../fixtures/VMWarePasswordAndCheck.fixture';

const testComponent = () => <VMWarePasswordAndCheck {...fixture.props} />;

describe('<VMWarePasswordAndCheck />', () => {
  it('renders correctly', () => {
    const component = mount(testComponent());
    expect(component).toMatchSnapshot();
  });
});

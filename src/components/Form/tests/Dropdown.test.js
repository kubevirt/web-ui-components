import React from 'react';
import { mount } from 'enzyme';

import fixtures from '../fixtures/Dropdown.fixture';

const testFixture = index => {
  const Component = fixtures[index].component;
  const wrapper = mount(<Component {...fixtures[index].props} />);
  expect(wrapper).toMatchSnapshot();
};

describe('<DropdownControl />', () => {
  it('renders correctly without tooltips', () => {
    testFixture(0);
  });
  it('renders correctly with tooltips', () => {
    testFixture(1);
  });
});

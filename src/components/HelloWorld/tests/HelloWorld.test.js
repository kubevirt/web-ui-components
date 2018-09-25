import React from 'react';
import { shallow } from 'enzyme';
import HelloWorld from '../HelloWorld';

test('shallow render matches snapshot', () => {
  const wrapper = shallow(<HelloWorld />);
  expect(wrapper).toMatchSnapshot();
});

import React from 'react'
import { shallow } from 'enzyme'
import HelloWorld from './HelloWorld'

test('shallow render matches snapshot', () => {
  const view = shallow(<HelloWorld />)
  expect(view).toMatchSnapshot()
})

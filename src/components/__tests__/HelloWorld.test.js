import React from 'react';
import { shallow } from 'enzyme';

import { HelloWorld } from '../../index';

describe('<HelloWorld />', () => {
  it('shallow render matches snapshot', () => {
    const view = shallow(<HelloWorld />);
    expect(view).toMatchSnapshot();
  });
});

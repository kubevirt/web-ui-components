import React from 'react';
import { shallow } from 'enzyme';

import { FormRow, ValidationFormRow, FormControlLabel } from '../FormRow';

describe('<FormRow />', () => {
  it('renders FormRow correctly', () => {
    const component = shallow(<FormRow>test</FormRow>);
    expect(component).toMatchSnapshot();
  });
  it('renders ValidationFormRow correctly', () => {
    const component = shallow(<ValidationFormRow>test</ValidationFormRow>);
    expect(component).toMatchSnapshot();
  });
  it('renders FormControlLabel correctly', () => {
    const component = shallow(<FormControlLabel title="test" />);
    expect(component).toMatchSnapshot();
  });
});

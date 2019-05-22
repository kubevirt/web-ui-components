import React from 'react';
import { shallow } from 'enzyme';

import { FormRow, ValidationFormRow, FormControlLabel, HelpFormRow } from '../FormRow';

describe('<FormRow />', () => {
  it('renders HelpFormRow correctly', () => {
    const component = shallow(<HelpFormRow>test</HelpFormRow>);
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
  it('renders FormRow correctly', () => {
    const component = shallow(<FormRow title="test" />);
    expect(component).toMatchSnapshot();
  });
});

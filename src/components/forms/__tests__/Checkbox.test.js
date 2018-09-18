import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox } from '../Checkbox';

const testCheckboxControl = () => <Checkbox checked fieldKey="key" onChange={() => {}} title="title" />;

describe('<CheckboxControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testCheckboxControl());
    expect(component).toMatchSnapshot();
  });
});

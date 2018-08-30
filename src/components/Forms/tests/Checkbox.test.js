import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox } from '../Checkbox';

const testCheckboxControl = () => <Checkbox id="1" checked onChange={() => {}} title="title" />;

describe('<CheckboxControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testCheckboxControl());
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import { Dropdown } from '../Dropdown';
import { allFormFields } from '../FormFactory.fixtures';

const testDropdownControl = () => (
  <Dropdown fieldKey="key" onChange={() => {}} value="val" choices={allFormFields.dropdownField.values} />
);

describe('<DropdownControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testDropdownControl());
    expect(component).toMatchSnapshot();
  });
});

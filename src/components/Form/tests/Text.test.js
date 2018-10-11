import React from 'react';
import { shallow } from 'enzyme';
import { Text } from '../Text';

const testTextControl = () => <Text id="1" onChange={() => {}} value="val" />;

describe('<TextControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testTextControl());
    expect(component).toMatchSnapshot();
  });
});

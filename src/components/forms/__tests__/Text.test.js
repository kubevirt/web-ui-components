import React from 'react';
import { shallow } from 'enzyme';
import { Text } from '../';

const testTextControl = () => <Text fieldKey="key" onChange={() => {}} value="val" />;

describe('<TextControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testTextControl());
    expect(component).toMatchSnapshot();
  });
});

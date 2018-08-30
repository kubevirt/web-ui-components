import React from 'react';
import { shallow } from 'enzyme';
import { TextArea } from '../TextArea';

const testTextAreaControl = () => <TextArea id="1" onChange={() => {}} value="val" />;

describe('<TextAreaControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testTextAreaControl());
    expect(component).toMatchSnapshot();
  });
});

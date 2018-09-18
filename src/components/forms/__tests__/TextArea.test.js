import React from 'react';
import { shallow } from 'enzyme';
import { TextArea } from '../';

const testTextAreaControl = () => <TextArea fieldKey="key" onChange={() => {}} value="val" />;

describe('<TextAreaControl />', () => {
  it('renders correctly', () => {
    const component = shallow(testTextAreaControl());
    expect(component).toMatchSnapshot();
  });
});

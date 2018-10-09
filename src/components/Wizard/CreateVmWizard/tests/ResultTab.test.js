import React from 'react';
import { shallow } from 'enzyme';
import ResultTab from '../ResultTab';

describe('<ResultTab />', () => {
  it('renders progress correctly', () => {
    const component = shallow(<ResultTab success={null} result={null} />);
    expect(component).toMatchSnapshot();
  });

  it('renders success correctly', () => {
    const component = shallow(<ResultTab success result="Created VM" />);
    expect(component).toMatchSnapshot();
  });

  it('renders fail correctly', () => {
    const component = shallow(<ResultTab success={false} result="Failed to create VM" />);
    expect(component).toMatchSnapshot();
  });
});

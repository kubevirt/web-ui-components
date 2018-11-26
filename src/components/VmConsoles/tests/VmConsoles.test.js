import React from 'react';
import { shallow } from 'enzyme';

import { VmConsoles } from '../index';
import { downVmProps, startingVmProps } from '../fixtures/VmConsoles.fixture';

describe('<VmConsoles />', () => {
  it('renders correctly for a down VM', () => {
    const component = shallow(<VmConsoles {...downVmProps} />);
    expect(component).toMatchSnapshot();
  });
  it('renders correctly for a starting VM', () => {
    const component = shallow(<VmConsoles {...startingVmProps} />);
    expect(component).toMatchSnapshot();
  });
});

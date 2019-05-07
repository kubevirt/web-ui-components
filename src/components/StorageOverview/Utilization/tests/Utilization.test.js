import React from 'react';
import { shallow } from 'enzyme';

import { Utilization } from '../Utilization';
import { default as UtilizationFixtures } from '../fixtures/Utilization.fixture';

describe('<Utilization />', () => {
  it('renders correctly', () => {
    const component = shallow(<Utilization {...UtilizationFixtures.props} />);
    expect(component).toMatchSnapshot();
  });
  it('renders correctly in Loading state', () => {
    const component = shallow(<Utilization />);
    expect(component).toMatchSnapshot();
  });
});

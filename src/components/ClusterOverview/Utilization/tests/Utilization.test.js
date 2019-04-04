import React from 'react';
import { render } from 'enzyme';

import { Utilization } from '../Utilization';
import { default as UtilizationFixtures } from '../fixtures/Utilization.fixture';

describe('<Utilization />', () => {
  it('renders correctly', () => {
    const component = render(<Utilization {...UtilizationFixtures.props} />);
    expect(component).toMatchSnapshot();
  });
  it('renders correctly in Loading state', () => {
    const component = render(<Utilization />);
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { render } from 'enzyme';

import { Capacity } from '../Capacity';
import { default as CapacityFixtures, emptyCapacityStats } from '../fixtures/Capacity.fixture';

const testCapacityOverview = () => <Capacity {...CapacityFixtures.props} />;

describe('<Capacity />', () => {
  it('renders correctly', () => {
    const component = render(testCapacityOverview());
    expect(component).toMatchSnapshot();
  });

  it('renders correctly in Loading state', () => {
    const component = render(<Capacity capacityStats={emptyCapacityStats} />);
    expect(component).toMatchSnapshot();
  });
});

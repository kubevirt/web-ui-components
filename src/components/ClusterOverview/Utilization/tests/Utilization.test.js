import React from 'react';
import { render } from 'enzyme';

import { Utilization } from '../Utilization';
import { default as UtilizationFixtures } from '../fixtures/Utilization.fixture';

const testUtilizationOverview = () => <Utilization {...UtilizationFixtures.props} />;

describe('<Utilization />', () => {
  it('renders correctly', () => {
    const component = render(testUtilizationOverview());
    expect(component).toMatchSnapshot();
  });
});

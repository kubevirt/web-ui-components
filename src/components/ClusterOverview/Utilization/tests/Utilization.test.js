import React from 'react';
import { shallow } from 'enzyme';

import { Utilization } from '../Utilization';
import { default as UtilizationFixtures } from '../fixtures/Utilization.fixture';

const testUtilizationOverview = () => <Utilization {...UtilizationFixtures.props} />;

describe('<Utilization />', () => {
  it('renders correctly', () => {
    const component = shallow(testUtilizationOverview());
    expect(component).toMatchSnapshot();
  });
});

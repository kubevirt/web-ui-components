import React from 'react';
import { render } from 'enzyme';

import { SubsystemHealth } from '../SubsystemHealth';
import { default as HealthFixtures } from '../fixtures/SubsystemHealth.fixture';

const testHealthOverview = () => <SubsystemHealth {...HealthFixtures[0].props} />;

describe('<SubsystemHealth />', () => {
  it('renders correctly', () => {
    const component = render(testHealthOverview());
    expect(component).toMatchSnapshot();
  });
});

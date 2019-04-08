import React from 'react';
import { render } from 'enzyme';

import { OCSHealth } from '../Health';
import { default as HealthFixtures } from '../fixtures/Health.fixture';

const testHealthOverview = () => <OCSHealth {...HealthFixtures[0].props} />;

describe('<Health />', () => {
  it('renders correctly', () => {
    const component = render(testHealthOverview());
    expect(component).toMatchSnapshot();
  });
});

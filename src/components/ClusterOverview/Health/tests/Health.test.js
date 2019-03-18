import React from 'react';
import { render } from 'enzyme';

import { Health } from '../Health';
import { default as HealthFixtures } from '../fixtures/Health.fixture';

const testHealthOverview = () => <Health {...HealthFixtures[0].props} />;

describe('<Health />', () => {
  it('renders correctly', () => {
    const component = render(testHealthOverview());
    expect(component).toMatchSnapshot();
  });
});

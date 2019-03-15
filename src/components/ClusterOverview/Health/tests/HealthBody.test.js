import React from 'react';
import { shallow } from 'enzyme';

import Health from '../Health';
import { default as HealthFixtures } from '../fixtures/Health.fixture';

const testHealthOverview = () => <Health {...HealthFixtures[0].props} />;

describe('<Health />', () => {
  it('renders correctly', () => {
    const component = shallow(testHealthOverview());
    expect(component).toMatchSnapshot();
  });
});

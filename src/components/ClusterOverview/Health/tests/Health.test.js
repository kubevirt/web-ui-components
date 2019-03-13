import React from 'react';
import { shallow } from 'enzyme';

import { Health, Compliance } from '../Health';
import { default as HealthFixtures } from '../fixtures/Health.fixture';

const testHealthOverview = () => <Health {...HealthFixtures[0].props} />;

const testComplianceOverview = () => <Compliance {...HealthFixtures[1].props} />;

describe('<Health />', () => {
  it('renders correctly', () => {
    const component = shallow(testHealthOverview());
    expect(component).toMatchSnapshot();
  });
});

describe('<Compliance />', () => {
  it('renders correctly', () => {
    const component = shallow(testComplianceOverview());
    expect(component).toMatchSnapshot();
  });
});

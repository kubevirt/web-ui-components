import React from 'react';
import { render } from 'enzyme';

import { SubsystemHealth } from '../SubsystemHealth';
import { default as HealthFixtures } from '../fixtures/SubsystemHealth.fixture';

// eslint-disable-next-line react/prop-types
const testHealthOverview = ({ props }) => <SubsystemHealth {...props} />;

describe('<SubsystemHealth />', () => {
  HealthFixtures.forEach(fixture => {
    it(`renders ${fixture.name} orrectly`, () => {
      const component = render(testHealthOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
});

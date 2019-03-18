import React from 'react';
import { render } from 'enzyme';

import { Compliance } from '../Compliance';
import { default as ComplianceFixtures } from '../fixtures/Compliance.fixture';

const testComplianceOverview = () => <Compliance {...ComplianceFixtures[0].props} />;

describe('<Compliance />', () => {
  it('renders correctly', () => {
    const component = render(testComplianceOverview());
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { render, shallow } from 'enzyme';

import { Compliance, ComplianceConnected } from '../Compliance';
import { default as ComplianceFixtures } from '../fixtures/Compliance.fixture';
import { default as ClusterOverviewFixtures } from '../../fixtures/ClusterOverview.fixture';
import { ClusterOverviewContext } from '../../ClusterOverviewContext';

// eslint-disable-next-line react/prop-types
const testComplianceOverview = ({ props }) => <Compliance {...props} />;

describe('<Compliance />', () => {
  ComplianceFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testComplianceOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <ClusterOverviewContext.Provider value={ClusterOverviewFixtures[0].props}>
        <ComplianceConnected />
      </ClusterOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

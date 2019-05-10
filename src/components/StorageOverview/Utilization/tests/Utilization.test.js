import React from 'react';
import { render, shallow } from 'enzyme';

import { Utilization, UtilizationConnected } from '../Utilization';
import { default as UtilizationFixtures } from '../fixtures/Utilization.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';

// eslint-disable-next-line react/prop-types
const testUtilizationOverview = ({ props }) => <Utilization {...props} />;

const realDate = Date;

describe('<Utilization />', () => {
  beforeAll(() => {
    global.Date = class extends Date {
      constructor() {
        super();
        this.time = 'Fri May 10 2019 11:13:00 GMT+0200 (Central European Summer Time)';
      }

      toString() {
        return this.time;
      }
    };
  });
  afterAll(() => {
    global.Date = realDate;
  });
  UtilizationFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testUtilizationOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={StorageOverviewFixtures[0].props}>
        <UtilizationConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { render, shallow, mount } from 'enzyme';

import { Utilization, UtilizationConnected } from '../Utilization';
import { default as UtilizationFixtures } from '../fixtures/Utilization.fixture';
import { default as StorageOverviewFixtures } from '../../fixtures/StorageOverview.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';
import { selectDropdownItem } from '../../../../tests/enzyme';
import { ONE_HR, SIX_HR, TWENTY_FOUR_HR } from '../strings';

// eslint-disable-next-line react/prop-types
const testUtilizationOverview = ({ props }) => <Utilization {...props} />;

const getDurationDropdown = component => component.find('#metric-duration');

const testUtilizationResults = (component, duration) => {
  selectDropdownItem(getDurationDropdown(component), duration);
  const utilizationBody = component.find(Utilization);

  expect(utilizationBody.state().duration).toBe(duration);
};

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
  UtilizationFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testUtilizationOverview(fixture));
      expect(component).toMatchSnapshot();
    });
  });

  it('switches between metrics', () => {
    const component = mount(testUtilizationOverview(UtilizationFixtures[0]));
    // default metric loaded is for 6 hours
    const utilizationBody = component.find(Utilization);
    expect(utilizationBody.state().duration).toBe(SIX_HR);

    testUtilizationResults(component, ONE_HR);
    testUtilizationResults(component, TWENTY_FOUR_HR);
  });

  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={StorageOverviewFixtures[0].props}>
        <UtilizationConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });

  afterAll(() => {
    global.Date = realDate;
  });
});

import React from 'react';
import { shallow, render, mount } from 'enzyme';

import { Alerts, AlertsConnected } from '../Alerts';
import { default as AlertsFixtures } from '../fixtures/Alerts.fixture';
import { StorageOverviewContext } from '../../StorageOverviewContext';
import { selectDropdownItem } from '../../../../tests/enzyme';

import { ALL, WARNING, CRITICAL } from '../../../Dashboard/strings';

// eslint-disable-next-line react/prop-types
const testAlerts = ({ props }) => <Alerts {...props} />;

const getTypeDropdown = component => component.find('#alert-type');

const testAlertResults = (component, type) => {
  selectDropdownItem(getTypeDropdown(component), type);
  expect(component.state().type).toBe(type);
};

describe('<Alerts />', () => {
  AlertsFixtures.forEach(fixture => {
    it(`renders ${fixture.name} correctly`, () => {
      const component = shallow(testAlerts(fixture));
      expect(component).toMatchSnapshot();
    });
  });
  it('switches between alert dropdown options', () => {
    const component = mount(testAlerts(AlertsFixtures[0]));
    // default filter is ALL
    expect(component.state().type).toBe(ALL);
    testAlertResults(component, WARNING);
    testAlertResults(component, CRITICAL);
  });
  it('renders correctly with Provider', () => {
    const component = render(
      <StorageOverviewContext.Provider value={AlertsFixtures[0].props}>
        <AlertsConnected />
      </StorageOverviewContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});

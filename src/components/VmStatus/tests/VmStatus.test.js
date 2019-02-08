import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { shape } from 'prop-types';
import { render } from 'enzyme';

import { VmStatus, VmStatuses } from '../VmStatus';
import { getVmStatusDetail, getVmStatus } from '../getVmStatus';
import { vmFixtures } from '../fixtures/VmStatus.fixture';

const router = {
  history: new BrowserRouter().history,
  route: {
    location: {},
    match: {},
  },
};

const createContext = () => ({
  context: { router },
  childContextTypes: { router: shape({}) },
});

describe('<VmStatus vm />', () => {
  it('renders correctly', () => {
    const component = render(<VmStatus vm={vmFixtures.vmOff} />);
    expect(component).toMatchSnapshot();
  });
});

describe('getVmStatusDetail()', () => {
  it('macthes API objects correctly', () => {
    Object.keys(vmFixtures).forEach(key => {
      const fixture = vmFixtures[key];
      const status = getVmStatusDetail(
        fixture,
        fixture.podFixture,
        fixture.cdiPods,
        fixture.migration,
        fixture.dataVolumes
      );
      expect(status.status).toBe(fixture.expectedDetail || fixture.expected);
      expect(status.diskStatus).toBe(fixture.expectedDisksStatus);
      if (fixture.expectedPod) {
        expect(status.pod).toBe(fixture.expectedPod);
      }
    });
  });
});

describe('<VmStatus vm pod />', () => {
  it('renders correctly', () => {
    Object.keys(vmFixtures).forEach(key => {
      const fixture = vmFixtures[key];
      expect(
        render(
          <VmStatus
            vm={fixture}
            launcherPod={fixture.podFixture}
            importerPods={fixture.cdiPods}
            migration={fixture.migration}
            dataVolumes={fixture.dataVolumes}
          />,
          createContext()
        )
      ).toMatchSnapshot(key);
      expect(getVmStatus(fixture, fixture.podFixture, fixture.cdiPods, fixture.migration, fixture.dataVolumes)).toBe(
        fixture.expected
      );
    });
  });
});

describe('<VmStatuses vm pod />', () => {
  it('renders correctly', () => {
    Object.keys(vmFixtures).forEach(key => {
      const fixture = vmFixtures[key];
      expect(
        render(
          <VmStatuses
            vm={fixture}
            launcherPod={fixture.podFixture}
            cdiPods={fixture.cdiPods}
            migration={fixture.migration}
            dataVolumes={fixture.dataVolumes}
          />,
          createContext()
        )
      ).toMatchSnapshot(key);
    });
  });
});

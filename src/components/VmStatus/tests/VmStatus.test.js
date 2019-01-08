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
    const component = render(<VmStatus vm={vmFixtures[0]} />);
    expect(component).toMatchSnapshot();
  });
});

describe('getVmStatusDetail()', () => {
  it('macthes API objects correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      const fixture = vmFixtures[index];
      expect(
        getVmStatusDetail(fixture, fixture.podFixture, fixture.importerPodsFixture, fixture.migration).status
      ).toBe(fixture.expectedDetail || fixture.expected);
    }
  });
});

describe('<VmStatus vm pod />', () => {
  it('renders correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      const fixture = vmFixtures[index];
      expect(
        render(
          <VmStatus
            vm={fixture}
            launcherPod={fixture.podFixture}
            importerPods={fixture.importerPodsFixture}
            migration={fixture.migration}
          />,
          createContext()
        )
      ).toMatchSnapshot();
      expect(getVmStatus(fixture, fixture.podFixture, fixture.importerPodsFixture, fixture.migration)).toBe(
        fixture.expected
      );
    }
  });
});

describe('<VmStatuses vm pod />', () => {
  it('renders correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      const fixture = vmFixtures[index];
      expect(
        render(
          <VmStatuses
            vm={fixture}
            launcherPod={fixture.podFixture}
            importerPods={fixture.importerPodsFixture}
            migration={fixture.migration}
          />,
          createContext()
        )
      ).toMatchSnapshot();
    }
  });
});

import React from 'react';
import { render, shallow } from 'enzyme';
import { VmStatus, getVmStatusDetail, getVmStatus } from '../index';
import { vmFixtures } from '../fixtures/VmStatus.fixture';

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
      expect(getVmStatusDetail(fixture, fixture.podFixture, fixture.importerPodFixture, fixture.migration).status).toBe(
        fixture.expectedDetail || fixture.expected
      );
    }
  });
});

describe('<VmStatus vm pod />', () => {
  it('renders correctly', () => {
    for (let index = 0; index < vmFixtures.length; index++) {
      const fixture = vmFixtures[index];
      expect(
        shallow(
          <VmStatus
            vm={fixture}
            launcherPod={fixture.podFixture}
            importerPod={fixture.importerPodFixture}
            migration={fixture.migration}
          />
        )
      ).toMatchSnapshot();
      expect(getVmStatus(fixture, fixture.podFixture, fixture.importerPodFixture, fixture.migration)).toBe(
        fixture.expected
      );
    }
  });
});

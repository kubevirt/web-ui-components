import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { shape } from 'prop-types';
import { render } from 'enzyme';

import { VmStatus, VmStatuses } from '../VmStatus';
import vmFixtures from '../../../utils/status/vm/fixtures/vmStatus.fixture';

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

describe('<VmStatus vm pod />', () => {
  vmFixtures.forEach((fixture, idx) => {
    const resultStatus = fixture.expected || fixture.expectedSimple;
    it(`renders correctly ${idx} (${resultStatus})`, () => {
      expect(
        render(
          <VmStatus
            vm={fixture.vm}
            pods={fixture.podsFixture}
            importerPods={fixture.importerPodsFixture}
            migrations={fixture.migrations}
          />,
          createContext()
        )
      ).toMatchSnapshot();
    });
  });
});

describe('<VmStatuses vm pod />', () => {
  vmFixtures.forEach((fixture, idx) => {
    const resultStatus = fixture.expected || fixture.expectedSimple;
    it(`renders correctly ${idx} (${resultStatus})`, () => {
      expect(
        render(
          <VmStatuses
            vm={fixture.vm}
            pods={fixture.podsFixture}
            importerPods={fixture.importerPodsFixture}
            migrations={fixture.migrations}
          />,
          createContext()
        )
      ).toMatchSnapshot();
    });
  });
});

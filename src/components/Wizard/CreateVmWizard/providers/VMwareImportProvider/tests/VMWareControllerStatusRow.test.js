import React from 'react';
import { render } from 'enzyme';

import v2vVMwareDeploymentFixtures from '../../../../../../utils/status/v2vVMwareDeployment/fixtures/v2vVMwareDeploymentStatus.fixture';
import VMWareControllerStatusRow from '../VMWareControllerStatusRow';
import { createContext } from '../../../../../../tests/router';

describe('<VMWareControllerStatusRow deployment deploymentPods />', () => {
  v2vVMwareDeploymentFixtures.forEach((fixture, idx) => {
    const { expected, deployment, deploymentPods } = fixture;
    it(`renders correctly ${idx} (${expected})`, () => {
      expect(
        render(<VMWareControllerStatusRow deployment={deployment} deploymentPods={deploymentPods} />, createContext())
      ).toMatchSnapshot();
    });
  });
});
